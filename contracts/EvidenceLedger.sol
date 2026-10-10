// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceLedger
 * @notice Cryptographic Electronic Evidence Anchoring Contract for Indian Law Enforcement
 * @dev Aligned with Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63(4) admissibility standards.
 */
contract EvidenceLedger {
    struct EvidenceRecord {
        string firNumber;
        string policeStation;
        string investigatingOfficer;
        string fileSha256;
        string metadataUri;
        uint256 blockTimestamp;
        address loggedBy;
    }

    mapping(bytes32 => EvidenceRecord) public records;
    bytes32[] public allEvidenceHashes;

    event EvidenceAnchored(
        bytes32 indexed evidenceHash,
        string firNumber,
        string policeStation,
        string fileSha256,
        uint256 timestamp,
        address indexed loggedBy
    );

    function anchorEvidence(
        string memory _firNumber,
        string memory _policeStation,
        string memory _investigatingOfficer,
        string memory _fileSha256,
        string memory _metadataUri
    ) external returns (bytes32) {
        bytes32 recordKey = keccak256(abi.encodePacked(_firNumber, _fileSha256, block.timestamp, msg.sender));
        
        records[recordKey] = EvidenceRecord({
            firNumber: _firNumber,
            policeStation: _policeStation,
            investigatingOfficer: _investigatingOfficer,
            fileSha256: _fileSha256,
            metadataUri: _metadataUri,
            blockTimestamp: block.timestamp,
            loggedBy: msg.sender
        });

        allEvidenceHashes.push(recordKey);

        emit EvidenceAnchored(
            recordKey,
            _firNumber,
            _policeStation,
            _fileSha256,
            block.timestamp,
            msg.sender
        );

        return recordKey;
    }

    function verifyEvidence(bytes32 _recordKey) external view returns (
        string memory firNumber,
        string memory policeStation,
        string memory investigatingOfficer,
        string memory fileSha256,
        uint256 blockTimestamp,
        address loggedBy
    ) {
        EvidenceRecord memory r = records[_recordKey];
        require(r.blockTimestamp > 0, "Record not found");
        return (
            r.firNumber,
            r.policeStation,
            r.investigatingOfficer,
            r.fileSha256,
            r.blockTimestamp,
            r.loggedBy
        );
    }
}
