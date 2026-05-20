// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MiningSupplyChain {
    struct Event {
        string batchId;
        string eventType;
        uint256 timestamp;
        string dataHash;
        address actor;
    }

    mapping(string => Event[]) public batchHistory;
    
    event EventLogged(string indexed batchId, string eventType, string dataHash, address actor);

    function logEvent(
        string memory _batchId,
        string memory _eventType,
        string memory _dataHash
    ) public {
        Event memory newEvent = Event({
            batchId: _batchId,
            eventType: _eventType,
            timestamp: block.timestamp,
            dataHash: _dataHash,
            actor: msg.sender
        });

        batchHistory[_batchId].push(newEvent);
        
        emit EventLogged(_batchId, _eventType, _dataHash, msg.sender);
    }

    function getBatchHistoryCount(string memory _batchId) public view returns (uint256) {
        return batchHistory[_batchId].length;
    }

    function getBatchEvent(string memory _batchId, uint256 _index) public view returns (
        string memory, string memory, uint256, string memory, address
    ) {
        Event memory e = batchHistory[_batchId][_index];
        return (e.batchId, e.eventType, e.timestamp, e.dataHash, e.actor);
    }
}
