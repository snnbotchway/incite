// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.19;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint256 minimumContribution) public {
        deployedCampaigns.push(
            address(new Campaign(minimumContribution, msg.sender))
        );
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        address payable recipient;
        bool complete;
        uint256 value;
        uint256 approvalCount;
        mapping(address => bool) approvers;
    }

    address public manager;
    uint256 public minimumContribution;
    uint256 public contributorsCount;
    mapping(address => bool) contributors;
    Request[] public requests;

    constructor(uint256 _minimumContribution, address creator) {
        manager = creator;
        minimumContribution = _minimumContribution;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "Only the manager can perform this action"
        );
        _;
    }

    function contribute() public payable {
        require(
            msg.value >= minimumContribution,
            "Contribution amount is below minimum"
        );

        contributors[msg.sender] = true;
        contributorsCount++;
    }

    function createRequest(
        string memory _description,
        uint256 _value,
        address payable _recipient
    ) public onlyManager {
        Request storage newRequest = requests.push();
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.complete = false;
        newRequest.value = _value;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint256 _requestId) public {
        Request storage request = requests[_requestId];

        require(
            contributors[msg.sender],
            "Only contributors can approve requests"
        );
        require(
            !request.approvers[msg.sender],
            "Cannot approve request multiple times"
        );

        request.approvers[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 _requestId) public payable onlyManager {
        Request storage request = requests[_requestId];

        require(
            request.approvalCount > (contributorsCount / 2),
            "Not enough approvals"
        );
        require(!request.complete, "Request already complete");

        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
