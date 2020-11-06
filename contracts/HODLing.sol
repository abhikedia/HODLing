pragma solidity >0.5.0<=0.6.0;

contract HODLing
{
    uint penalties=0;                                                                   //to keep track of how much penalty was imposed.
    address owner;

    constructor() public
    {
        owner=msg.sender;
    }

    struct HOLD
    {
        uint booking_time;                                                              //Time at which holding was created.
        uint mature_time;                                                               //Time at which holding can be withdrawn without penalties.
        uint amount;                                                                    //Amount deposited in that holding.
    } 
    mapping(address=>mapping(uint16=>HOLD)) holdings;                                   //to store holdings by users on the basis of id.
    mapping(address=>uint16) counter;                                                   //for unique id of every holding created by a user.
    mapping(address=>mapping(uint16=>bool)) marker;                                     //to check whether a holding is still active.

    function Lock(uint _time) public payable returns(uint)                              //to create a new holding, returns unique id of holding
    {
        require(msg.value>0 wei);
        uint16 temp=++counter[msg.sender];
        holdings[msg.sender][temp]=HOLD(now,now+(_time*1 days),msg.value*(10**18));
        marker[msg.sender][temp]=true;
        return temp;
    }

    function checkTime(uint16 _id) public view returns(uint)                            //to check the return time
    {
        require(marker[msg.sender][_id]);
        return holdings[msg.sender][_id].mature_time;
    }

    function Withdraw(uint16 _id) public payable returns(uint)                          //returns the amount received
    {
        require(marker[msg.sender][_id]);
        marker[msg.sender][_id]=false;  
        uint _amount;

        if(holdings[msg.sender][_id].mature_time<=now)                                  //The user has to rewarded
        {
            uint number_of_days=(now-holdings[msg.sender][_id].mature_time)/1 days;
            if((0.00005*(10**18))>((penalties)/100000))                                 //If 0.005% per day is cheaper for the contract.
                _amount=(penalties*number_of_days)/100000;
            else                                                                        //If 0.001 ETH per day is cheaper for the contract
                _amount=0.00005*(10**18)* number_of_days;

            if(_amount>penalties)                                                       //Checking if penalties has enough funds.
            {
                _amount=penalties;
                penalties=0;
            }
            else
                penalties-=_amount;
    
            msg.sender.call.value(_amount+holdings[msg.sender][_id].amount);
            return penalties+holdings[msg.sender][_id].amount;
        }
        else                                                                            //The user has to be penalised.
        {
            uint number_of_days=(holdings[msg.sender][_id].mature_time-now)/1 days;
            if((holdings[msg.sender][_id].amount/(10**5)) > (0.0001 * (10**18)))
                _amount=0.0001 * (10**18) * number_of_days;
            else
                _amount=holdings[msg.sender][_id].amount/(10**5) * number_of_days;

            penalties+=_amount;
            msg.sender.call.value(holdings[msg.sender][_id].amount-_amount);
            return holdings[msg.sender][_id].amount-_amount;
        }
    }

    function getBalance() public view returns(uint)                                     //Get balance of the contract
    {
        require(msg.sender==owner);
        return address(this).balance;
    }

    function getPenalties() public view returns(uint)                                   //Get current amount in penalties
    {
        require(msg.sender==owner);
        return penalties;
    }
}