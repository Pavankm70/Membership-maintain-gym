package com.gymsphere.service;

import com.gymsphere.dto.MemberDto;
import com.gymsphere.entity.Member;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.MemberRepository;
import com.gymsphere.repository.SubscriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final SubscriptionRepository subscriptionRepository;

    public MemberService(MemberRepository memberRepository, SubscriptionRepository subscriptionRepository) {
        this.memberRepository = memberRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public Page<MemberDto> searchMembers(String query, String status, Pageable pageable) {
        return memberRepository.searchMembers(query, status, pageable)
                .map(this::toDto);
    }

    public MemberDto getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
        return toDto(member);
    }

    @Transactional
    public MemberDto createMember(MemberDto dto) {
        if (memberRepository.findByEmail(dto.getEmail().trim()).isPresent()) {
            throw new BadRequestException("A member with email '" + dto.getEmail() + "' already exists.");
        }
        if (memberRepository.findByPhone(dto.getPhone().trim()).isPresent()) {
            throw new BadRequestException("A member with phone number '" + dto.getPhone() + "' already exists.");
        }

        Member member = new Member(
                dto.getFullName().trim(),
                dto.getEmail().trim(),
                dto.getPhone().trim(),
                dto.getGender(),
                dto.getDateOfBirth(),
                dto.getJoinDate(),
                dto.getStatus() != null ? dto.getStatus() : "ACTIVE"
        );

        Member saved = memberRepository.save(member);
        return toDto(saved);
    }

    @Transactional
    public MemberDto updateMember(Long id, MemberDto dto) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));

        if (memberRepository.existsByEmailAndMemberIdNot(dto.getEmail().trim(), id)) {
            throw new BadRequestException("Another member is already using email '" + dto.getEmail() + "'.");
        }
        if (memberRepository.existsByPhoneAndMemberIdNot(dto.getPhone().trim(), id)) {
            throw new BadRequestException("Another member is already using phone '" + dto.getPhone() + "'.");
        }

        member.setFullName(dto.getFullName().trim());
        member.setEmail(dto.getEmail().trim());
        member.setPhone(dto.getPhone().trim());
        member.setGender(dto.getGender());
        member.setDateOfBirth(dto.getDateOfBirth());
        member.setJoinDate(dto.getJoinDate());
        if (dto.getStatus() != null) {
            member.setStatus(dto.getStatus());
        }

        Member updated = memberRepository.save(member);
        return toDto(updated);
    }

    @Transactional
    public void deleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));

        // Referential integrity check: protect dependent subscriptions
        if (!subscriptionRepository.findByMemberMemberId(id).isEmpty()) {
            throw new BadRequestException(
                "Cannot permanently delete member '" + member.getFullName() + 
                "' because historical subscriptions/payment records exist. " +
                "To preserve DBMS financial integrity, please update their status to 'INACTIVE' instead."
            );
        }

        memberRepository.delete(member);
    }

    public MemberDto toDto(Member entity) {
        MemberDto dto = new MemberDto();
        dto.setMemberId(entity.getMemberId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setGender(entity.getGender());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setJoinDate(entity.getJoinDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
