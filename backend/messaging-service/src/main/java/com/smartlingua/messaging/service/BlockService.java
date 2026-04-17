package com.smartlingua.messaging.service;

import com.smartlingua.messaging.entity.UserBlock;
import com.smartlingua.messaging.repository.UserBlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlockService {

    @Autowired
    private UserBlockRepository blockRepository;

    public boolean isBlocked(Long receiverId, Long senderId) {
        return blockRepository.existsByBlockerIdAndBlockedId(receiverId, senderId);
    }

    @Transactional
    public void block(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) throw new IllegalArgumentException("Cannot block yourself.");
        if (blockRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) return;
        blockRepository.save(new UserBlock(blockerId, blockedId));
    }

    @Transactional
    public void unblock(Long blockerId, Long blockedId) {
        blockRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    public List<Long> getBlockedUserIds(Long blockerId) {
        return blockRepository.findByBlockerId(blockerId).stream()
                .map(UserBlock::getBlockedId)
                .collect(Collectors.toList());
    }
}
