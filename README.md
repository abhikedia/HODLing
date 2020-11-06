# HODLing

### Note: This contract can hold a maximum of 65,535 holdings per address.

There can be several ways in which this contract can be written-
1. **Creating a unique id for every holding.** The drawback here is if the id is lost by the creator, he will loose his deposit too.
2. **Mapping holding to the address of the creator.** The drawback here is if the creator wants to make multiple deposits, it won't be possible.
3. **Mapping array of holdings to address of the creator.** Since there can be only one holding that can be created at an instant, the creation time can act as unique identifier of all the holdings. The drawback here is if someone has many holdings, then iterating through every holding will consume a lot of gas.
4. **Creating nested mapping of address and creation time.** This way if the creator has the time at which he created the holding, he can check the details of his holdings and withdraw but if he looses it, he won't be able to check the details (because it is not possible to iterate through mapping in solidity).
5. **Creating two mappings, one which maps address to holdings and one which maps address to unique ids.** This is the safest way to create holdings. Just in case if the creator looses all the details, he still can find his holdings through his address. Although, every possible value between 0-65,535 has to be checked off-chain. (There is another way to avoid this computation but that will result in use of extra gas.)

## Rewards/Penalties
The rewards can be given to user if he is withdrawing the amount after the holding time is over. Also, the rewards has to be given from the penalties charged by other customers. If there is no penalty, no rewards can be given. 
To make the system foolproof, the rewards given per day should be much smaller when compared to the penalties charged. 

The penalies charged are based on the amount deposited and number of days remaining from the date of withdrawal. The penalties are charged at the rate of 0.001% per day. But this amount can be large for huge deposits which might not be suitable for the holder. So there is a cap value of 0.0001 ETH per day, whichever is smaller.
<br>
The rewards has to be significantly lesser than the penalties. The rewards are given for the extra days deposit was present in the contract at the rate of 0.0001% of the amount collected on penalties (per day, at the date of withdrawal). Since this amount can be huge as well making the penalties funds draining faster, there is an upper limit of 0.00005 ETH per day.
