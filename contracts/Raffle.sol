// Raffle
// Enter the lottery (paying some amount)
//Pick a  random winner (has to verifiably random)
// Winner to be selected every X minutes -> completely automated
// Going to have to use chainlink Oracle -> Randomness, Automated Execution (Chainlink Keeper)

// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.17 < 0.9.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
error Raffle__NotEnoughETHEntered();
error Raffle__TransferNotSuccessful();
error Raffle__NotOpen();
error Raffle__UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);


/**@title A Sample Raffle Contract
 * @author Adejorin Abel
 * @notice This contract is for creating an untamperable decentralized smart contract
 * @dev This implements Chainlink VRF v2 and Chainlink Keeper
 * 
 */
contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    
    
    /* Type declaration */
    enum RaffleState {
        /**
         * uint256 0 implies OPEN
         * uint256 1 implies CALCULATING
         */
        OPEN,
        CALCULATING
    }

    /* State Variables */
    address payable[] private s_players;
    uint256 private immutable i_entranceFee;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    //Lottery State Variables
    address private s_recentWinner;
    RaffleState private s_raffleState; // to check if the lottery is open, closed, pending or calculating

    // Event Log
    event RaffleEnter(address indexed player);
    event RequestRaffleWinner(uint256 indexed requestId);
    event RaffleWinnerPicked(address indexed winner);

    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee, // Contract -  Mocks
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }

        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or maaping
        // Named events with the function name reversed

        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * They look for 'upKeepNeeded' to return true.
     * The following should be true in order to return true:
     * 1. Our Time Interval should have passed
     * 2. The lottery should have at least 1 player, and have some ETH
     * 3. Our subscription is funded with LINK
     * 4. The lottery should be in "open" state
     */
    function checkUpkeep(
        bytes memory /* checkData */
    ) 
    public 
    override 
    returns (bool upkeepNeeded, bytes memory /* performData */) {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = (address(this).balance > 0);
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    function performUpkeep(
        bytes calldata /* perforData */
    ) external override{
        // This is where chainlink VRF is needed for randomization
        // Request the random number
        // ONce we get it, do something with it
        // 2 Transaction process
        (bool upKeepNeeded, ) = checkUpkeep("");
        if(!upKeepNeeded){
            revert Raffle__UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING; //Updating the state so that nobody can enter the lottery and
        // no one can trigger a new update
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indeOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indeOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;

        //send fund to winner
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferNotSuccessful();
        }

        emit RaffleWinnerPicked(recentWinner);
    }


    // View, Pure functions

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns(RaffleState){
        return s_raffleState;
    }

    function getNumWords() public pure returns(uint256){
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns(uint256){
        return s_players.length;
    }

    function getLastTimeStamp() public view returns(uint256){
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns(uint256){
        return REQUEST_CONFIRMATION;
    }

    function getInterval() public view returns(uint256){
        return i_interval;
    }

}
