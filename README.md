# HODLing

### Note: This contract can hold a maximum of 65,535 holdings per address.

There can be several ways in which this contract can be written-
1. **Creating a unique id for every holding.** The drawback here is if the id is lost by the creator, he will loose his deposit too.
2. **Mapping holding to the address of the creator.** The drawback here is if the creator wants to make multiple deposits, it won't be possible.
3. **Mapping array of holdings to address of the creator.** Since there can be only one holding that can be created at an instant, the creation time can act as unique identifier of all the holdings. The drawback here is if someone has many holdings, then iterating through every holding will consume a lot of gas.
4. **Creating nested mapping of address and creation time.** This way if the creator has the time at which he created the holding, he can check the details of his holdings and withdraw but if he looses it, he won't be able to check the details (because it is not possible to iterate through mapping in solidity).
5. **Creating two mappings, one which maps address to holdings and one which maps address to unique ids.** This is the safest way to create holdings. Just in case if the creator looses all the details, he still can find his holdings through his address. 
<br>

One of the possible ways to still have access to withdrawal if id is lost can be keeping a record of all the trasaction ids on-chain. But this will result in extra gas consumption and once a withdrawal completes, that specific id has to be deleted and remaining elements has to be rearranged to fill the gap which also consumes gas. <br>

To avoid the consumption of extra gas, this contract uses method 5. For every holding, a unique id is generated for that address. If a person looses his transaction id, but still uses the same address, it is still possible to iterate through all the values from 1 to 65,535. The function **getAmount()** can be called off-chain by the person for every possible id, and the amount can be verified. Once the id is known, withdrawal can also be done. The reason this number is chosen because it is neither too small, nor too big and can be in service for a long time.
<br>

## Rewards/Penalties
This contract stores the funds in period of days. The rewards can be given to user if he is withdrawing the amount after the holding period is over. Also, the rewards has to be given from the penalties charged by other customers. If there is no penalty, no rewards can be given. 
To make the system foolproof, the rewards given per day should be much smaller when compared to the penalties charged on daily basis. 

### Penalties
The penalies are charged based on the amount deposited and number of days remaining from the deadline. For Example, if an user deposits 10 ETH on Oct 07,2020 for 10 days and if tries to withdraw on Oct 13,2020, the penalties will be put on 10 ETH for 4 days. The penalties are charged at the rate of 0.001% per day. But this amount can be large for huge deposits which might not be suitable for the holder. So there is a cap value of 0.0001 ETH per day. So this concludes, per day penalty to minimum(0.0001 ETH, 0.001%);
<br><br>
### Rewards
The rewards has to be significantly lesser than the penalties. The rewards are given for the extra days deposit was present in the contract at the rate of 0.0001% of the amount collected on penalties (per day, at the date of withdrawal). For example, if the holding got matured on Oct 10, 2020 and the user tries to withdraw on Oct 20, 2020 and the amount present in penalties is 10 ETH, thr rewards will be given on 10 ETH for 10 days.
Since this amount can be huge as well making the penalties funds draining faster, there is an upper limit of 0.00005 ETH per day. This means, the reward will be minimum(0.00005 ETH, 0.0001%) per day.

## Functions Description
1. Lock()- To create a new holding for specified number of days.
2. getAmount()- To check amount of holding in case a person looses transaction id.
3. getLastId()- In web3, its not possible to return a value from a function called using send. So this function needs to be called simultaneously every time Lock() is called. It returns id of last holding.
4. checkTime(): To check when a holding is getting matured.
5. Withdraw(): To withdraw amount from the deposit.
6. getBalance(): To check the balance of contract(only to be called by the owner).
7. getPenalties(): To check penalty present in the contract at a particular instant (only to be called by the owner).
