package com.gymsphere.service;

import com.gymsphere.dto.SubscriptionDto;
import com.gymsphere.entity.Member;
import com.gymsphere.entity.MembershipPlan;
import com.gymsphere.entity.Subscription;
import com.gymsphere.entity.Trainer;
import com.gymsphere.exception.BadRequestException;
import com.gymsphere.exception.ResourceNotFoundException;
import com.gymsphere.repository.MemberRepository;
import com.gymsphere.repository.MembershipPlanRepository;
import com.gymsphere.repository.SubscriptionRepository;
import com.gymsphere.repository.TrainerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final MemberRepository memberRepository;
    private final MembershipPlanRepository planRepository;
    private final TrainerRepository trainerRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               MemberRepository memberRepository,
                               MembershipPlanRepository planRepository,
                               TrainerRepository trainerRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.memberRepository = memberRepository;
        this.planRepository = planRepository;
        this.trainerRepository = trainerRepository;
    }

    public Page<SubscriptionDto.Response> searchSubscriptions(String query, String status, Pageable pageable) {
        return subscriptionRepository.searchSubscriptions(query, status, pageable)
                .map(this::toResponse);
    }

    public SubscriptionDto.Response getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        return toResponse(subscription);
    }

    public List<SubscriptionDto.Response> getSubscriptionsByMemberId(Long memberId) {
        return subscriptionRepository.findByMemberMemberId(memberId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubscriptionDto.Response createSubscription(SubscriptionDto.CreateRequest request) {
        Member member = memberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getMemberId()));

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + request.getPlanId()));

        // Business Rule: Prevent duplicate active subscriptions for the same member
        if (subscriptionRepository.existsByMemberMemberIdAndStatus(member.getMemberId(), "ACTIVE")) {
            throw new BadRequestException("Member '" + member.getFullName() + "' already has an ACTIVE subscription. " +
                    "Please cancel or wait for expiration before starting a new active membership, or renew existing.");
        }

        Trainer trainer = null;
        if (request.getTrainerId() != null) {
            trainer = trainerRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + request.getTrainerId()));
        }

        LocalDate start = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        // Automatically calculate end date based on plan's duration_months
        LocalDate end = start.plusMonths(plan.getDurationMonths());

        Subscription subscription = new Subscription(
                member,
                plan,
                trainer,
                start,
                end,
                "ACTIVE",
                plan.getPrice() // Preserve snapshot of price at purchase time
        );

        Subscription saved = subscriptionRepository.save(subscription);
        return toResponse(saved);
    }

    @Transactional
    public SubscriptionDto.Response updateStatus(Long id, String status) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        String upper = status.toUpperCase().trim();
        if (!upper.equals("ACTIVE") && !upper.equals("EXPIRED") && !upper.equals("CANCELLED") && !upper.equals("PENDING")) {
            throw new BadRequestException("Invalid subscription status: " + status);
        }

        subscription.setStatus(upper);
        Subscription updated = subscriptionRepository.save(subscription);
        return toResponse(updated);
    }

    @Transactional
    public SubscriptionDto.Response updateTrainer(Long id, Long trainerId) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        Trainer trainer = null;
        if (trainerId != null) {
            trainer = trainerRepository.findById(trainerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer not found with id: " + trainerId));
        }

        subscription.setTrainer(trainer);
        Subscription updated = subscriptionRepository.save(subscription);
        return toResponse(updated);
    }

    @Transactional
    public void deleteSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        subscriptionRepository.delete(subscription);
    }

    public SubscriptionDto.Response toResponse(Subscription s) {
        SubscriptionDto.Response r = new SubscriptionDto.Response();
        r.setSubscriptionId(s.getSubscriptionId());
        r.setMemberId(s.getMember().getMemberId());
        r.setMemberName(s.getMember().getFullName());
        r.setMemberEmail(s.getMember().getEmail());
        r.setMemberPhone(s.getMember().getPhone());
        r.setPlanId(s.getPlan().getPlanId());
        r.setPlanName(s.getPlan().getPlanName());
        r.setDurationMonths(s.getPlan().getDurationMonths());
        if (s.getTrainer() != null) {
            r.setTrainerId(s.getTrainer().getTrainerId());
            r.setTrainerName(s.getTrainer().getFullName());
        } else {
            r.setTrainerName("None Assigned");
        }
        r.setStartDate(s.getStartDate());
        r.setEndDate(s.getEndDate());
        r.setStatus(s.getStatus());
        r.setAmountAtPurchase(s.getAmountAtPurchase());
        r.setCreatedAt(s.getCreatedAt());

        long days = ChronoUnit.DAYS.between(LocalDate.now(), s.getEndDate());
        r.setDaysRemaining(Math.max(0, days));

        return r;
    }
}
