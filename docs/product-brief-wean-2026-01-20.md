# Product Brief: Wean

**Date:** 2026-01-20
**Author:** Jarad DeLorenzo
**Version:** 1.0
**Project Type:** mobile-app
**Project Level:** 2

---

## Executive Summary

Wean is a mobile app for habitual Kratom users who want to reduce or quit their intake. It enables systematic, gradual tapering that accounts for Kratom's long half-life, making the process feel achievable rather than punishing. For a substance where cold turkey triggers heroin-like withdrawal, a structured taper plan transforms "quitting" into a series of small wins.

---

## Problem Statement

### The Problem

Habitual Kratom users face a critical gap in harm reduction tools. Current users lose track of their daily consumption, cannot measure whether they're successfully reducing intake, and have no structured framework for tapering. This lack of visibility and accountability makes quitting feel impossible, trapping users in addiction cycles where the path of least resistance is continued use.

### Why Now?

Kratom has transitioned from niche supplement shops to mainstream retail (gas stations, convenience stores, online marketplaces), dramatically expanding the user base. This increased accessibility has created a larger market of users who want help reducing or quitting. Additionally, regulatory scrutiny is growing, making now the ideal time to establish Wean as the trusted solution before potential competitors or regulatory mandates enter the space.

The creator has an existing codebase with core functionality already built, reducing time-to-market and allowing rapid iteration based on real user feedback. This positions Wean to capture early market share in an underserved niche.

### Impact if Unsolved

Without structured support, users remain trapped in addiction because quitting cold turkey is extraordinarily painful (comparable to opioid withdrawal). The absence of tracking creates a psychological barrier where users convince themselves they're reducing when they're actually maintaining or increasing intake. This perpetuates health risks, financial costs, and the social stigma associated with dependency. For many users, staying addicted becomes the default state—not by choice, but by lack of actionable alternatives.

---

## Target Audience

### Primary Users

**Habitual Kratom Users Seeking Reduction or Cessation**
- Age: 25-45 (primary demographic for Kratom use)
- Psychographics: Self-directed individuals who prefer harm reduction over abstinence-based approaches; likely have tried quitting before and failed
- Behavior: Daily or near-daily Kratom users (2-20g+ per day), primarily consuming powder, capsules, or extracts
- Pain Points: Cannot track intake accurately, lack accountability, experience severe withdrawal when attempting to quit, feel shame about dependency
- Willingness to Pay: High—users are already spending $50-300/month on Kratom; a $10-30/month subscription for successful reduction is both affordable and financially rational (reduced consumption = lower Kratom costs)

**Secondary Segment: Casual Users Seeking Moderation**
- Less frequent users (2-4x per week) who want to prevent escalation into dependency
- More price-sensitive but may adopt freemium model with upgrade path

### Secondary Users

**Support Network Members**
- Spouses, partners, family members who want visibility into their loved one's progress
- Feature opportunity: Anonymous progress sharing or accountability partner features (Phase 2)

**Harm Reduction Counselors and Addiction Coaches**
- Professionals seeking tools to support clients' taper plans
- Feature opportunity: Professional dashboard for monitoring multiple clients (Phase 3, potential B2B revenue stream)

**Healthcare Providers**
- Primary care physicians, psychiatrists treating patients with substance use concerns
- Feature opportunity: HIPAA-compliant data export for medical records (long-term consideration)

### User Needs

**Functional Needs:**
- Accurate dose tracking with timestamp and unit conversion (grams/ounces)
- Visual representation of daily totals and weekly/monthly trends
- Personalized taper schedule generation based on current intake
- Progress tracking against taper goals
- Historical calendar view to identify patterns
- Reminder system for scheduled doses

**Emotional Needs:**
- Non-judgmental interface that celebrates incremental progress
- Sense of control and agency over reduction process
- Visual evidence of success to maintain motivation
- Privacy and discretion (no social features that expose usage)

**Outcome Needs:**
- Measurable reduction in daily intake over time
- Mitigation of withdrawal symptoms through gradual tapering
- Achievement of personal goals (quit entirely, reduce to weekend use, etc.)
- Improved health markers and quality of life

---

## Solution Overview

### Proposed Solution

Wean is a cross-platform mobile app (iOS, Android, web) that combines dose tracking, data visualization, and intelligent taper planning to help Kratom users reduce or quit. Built on React Native/Expo with Firebase backend, the app provides a frictionless logging experience with powerful analytics that transform abstract "I want to quit" intentions into concrete, achievable daily actions.

The app removes the cognitive burden of tracking and planning by automating the math—users simply log doses, and Wean calculates daily totals, identifies trends, and suggests taper schedules based on evidence-based harm reduction principles (gradual reduction of 5-10% per week).

### Key Features

**MVP (Current State & Immediate Enhancements):**
- **Quick Dose Logging**: Slider-based entry with gram/ounce unit selection, timestamp capture
- **Daily Dose Gauge**: Visual circular progress indicator showing total intake vs. target, color-coded for at-a-glance status
- **Rolling Calendar Week**: 7-day horizontal calendar for reviewing historical doses and selecting dates
- **Daily Dose Timeline**: Chronological list of all doses for selected day with edit/delete capabilities
- **Dark/Light Mode**: User preference with persistence
- **Anonymous Authentication**: Firebase-based auth with user-specific data isolation

**Revenue-Driving Premium Features (Phase 1 - Q1 2026):**
- **Smart Taper Planner**: AI-assisted taper schedule generation based on current usage patterns, desired timeline, and reduction comfort level
- **Weekly/Monthly Trend Analytics**: Charts showing intake trends, average daily doses, successful reduction streaks
- **Goal Setting & Milestone Celebrations**: Define personal targets (e.g., "reduce to 5g/day by March"), track progress, unlock achievement badges
- **Dose Reminders & Alerts**: Scheduled notifications for planned doses, alerts when approaching daily limit
- **Export & Backup**: PDF reports for personal records or healthcare provider sharing, data export for portability

**Future Premium Features (Phase 2 - Q2-Q3 2026):**
- **Accountability Partners**: Opt-in progress sharing with trusted contacts
- **Withdrawal Symptom Tracker**: Log and correlate symptoms with reduction rate to optimize taper speed
- **Supplement Integration**: Track complementary substances (magnesium, vitamin C) used for withdrawal management
- **Apple Health / Google Fit Integration**: Correlate Kratom use with sleep, activity, and mood data
- **Meditation & Coping Tools**: In-app guided exercises for managing cravings

**Enterprise Features (Phase 3 - 2027):**
- **Provider Dashboard**: Multi-client view for addiction counselors and harm reduction professionals (B2B SaaS)

### Value Proposition

**For Users:**
"Quit Kratom without suffering. Wean turns the impossible task of quitting into a series of achievable daily wins through structured tracking and personalized taper plans. Track your doses in 10 seconds, see your progress in real-time, and finally break free—at your own pace."

**Differentiation:**
- **Substance-Specific Expertise**: Built specifically for Kratom's unique pharmacology (long half-life, dosing patterns), not a generic habit tracker
- **Harm Reduction Philosophy**: Non-judgmental, user-paced approach that meets people where they are
- **Simplicity Meets Power**: 10-second dose logging with sophisticated analytics under the hood
- **Privacy-First**: No social features that risk exposure; completely anonymous usage

**Competitive Advantage:**
- First-mover advantage in Kratom-specific tracking category
- Existing codebase reduces time-to-market
- Direct user empathy (creator's lived experience with the problem)
- Niche focus allows highly targeted marketing to underserved audience

---

## Business Objectives

### Goals

**Primary Objective:**
Establish Wean as the leading Kratom reduction app with sustainable recurring revenue within 12 months of launch.

**Specific Goals:**

**Q1 2026 (Launch + Early Growth):**
- Ship MVP to iOS App Store and Google Play Store
- Achieve 1,000 free user signups
- Validate freemium model with 5% conversion to premium ($9.99/month or $79.99/year)
- Generate first $500 MRR (Monthly Recurring Revenue)

**Q2 2026 (Growth + Retention):**
- Scale to 5,000 active users
- Increase premium conversion to 8-10%
- Reach $3,000 MRR
- Achieve 70% 30-day retention rate
- Collect 50+ user success stories and testimonials

**Q3-Q4 2026 (Scale + Optimization):**
- Grow to 15,000 active users
- Stabilize premium conversion at 10-12%
- Hit $15,000 MRR ($180K ARR run rate)
- Launch accountability partner features to increase engagement
- Explore B2B pilot with 3-5 addiction counselors

**Long-Term Vision (2027+):**
- Expand to adjacent substances (nicotine, cannabis, caffeine) using same taper framework
- Develop provider tools for B2B recurring revenue stream
- Consider acquisition opportunities from digital health companies or addiction treatment platforms

### Success Metrics

**Acquisition Metrics:**
- App store impressions, page views, and conversion rate
- Organic vs. paid user acquisition cost (target <$10 CAC through organic channels)
- Install-to-signup conversion rate (target >60%)

**Engagement Metrics:**
- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio (target >30% for sticky products)
- Average doses logged per user per week (target 10+, indicating habitual use)
- Session length and frequency (target 2-3 sessions/day, 30-60 seconds each)

**Retention Metrics:**
- Day 1, Day 7, Day 30 retention rates (target 80% / 50% / 30%)
- Cohort retention curves by signup month
- Churn rate for premium subscribers (target <5% monthly churn)

**Revenue Metrics:**
- Monthly Recurring Revenue (MRR) and Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- Free-to-paid conversion rate (target 10%)
- Customer Lifetime Value (LTV) - target LTV:CAC ratio of 3:1 minimum
- Premium feature adoption rates

**Product-Market Fit Metrics:**
- Net Promoter Score (NPS) - target >40
- App store ratings (target 4.5+ stars)
- Percentage of users achieving 25%+ reduction in 30 days (target >60%)
- User-reported successful quit rate (target >20% within 90 days)

**Qualitative Metrics:**
- User testimonials and success stories
- Support ticket volume and sentiment
- Feature request themes

### Business Value

**Direct Revenue:**
- Freemium subscription model: $9.99/month or $79.99/year (20% discount for annual)
- Target user base: 50,000 Kratom users in US alone (conservative estimate from 1-2M total users)
- At 10% premium conversion: 5,000 paying users = $50K MRR ($600K ARR)
- At scale (100K users, 10% conversion): $100K MRR ($1.2M ARR)

**Cost Savings for Users:**
- Average Kratom user spends $100-200/month on product
- Successful 50% reduction = $50-100/month savings
- Wean subscription at $10/month = 10:1 ROI for users who reduce intake
- This creates powerful word-of-mouth viral loop

**Market Positioning:**
- Establishes brand authority in emerging digital therapeutics space
- Builds user base and engagement data for potential acquisition
- Platform foundation for expanding to other substance reduction categories

**Social Impact:**
- Reduces harm from Kratom dependency
- Lowers healthcare costs associated with addiction treatment
- Provides alternative to abstinence-only approaches, meeting users where they are

**Strategic Value:**
- Proprietary data on Kratom usage patterns (anonymized) is valuable for research, policy
- Potential partnerships with supplement brands, harm reduction organizations
- Foundation for building digital health company with multiple product lines

---

## Scope

### In Scope

**For MVP Launch (Q1 2026):**
- Cross-platform mobile app (iOS, Android) with web support
- Anonymous user authentication with Firebase
- Core dose tracking with unit conversion (grams/ounces)
- Daily dose gauge with visual progress indicator
- Rolling 7-day calendar for historical review
- Daily dose timeline with edit/delete functionality
- Dark/light theme toggle
- App store submission and approval process
- Basic analytics instrumentation (Mixpanel or similar)

**For Premium V1 (Q1-Q2 2026):**
- Freemium paywall implementation (Stripe or RevenueCat integration)
- Smart taper planner with personalized schedules
- Weekly/monthly trend charts and analytics
- Goal setting and milestone tracking
- Dose reminder push notifications
- PDF export and data backup features
- Enhanced onboarding flow with value demonstration

**User Experience:**
- Intuitive, friction-free dose logging (10 seconds or less)
- Beautiful, motivational UI that celebrates progress
- Privacy-first design (no social sharing, no account required beyond anonymous auth)
- Accessibility compliance (WCAG 2.1 AA standards)

**Infrastructure:**
- Firebase Firestore for real-time data sync
- Firebase Cloud Functions for taper algorithm and scheduled tasks
- CI/CD pipeline for automated testing and deployment
- Error monitoring and crash reporting (Sentry)

### Out of Scope

**Explicitly Excluded from V1:**
- Social features, community forums, or user-to-user messaging (privacy and liability concerns)
- Direct integration with healthcare systems or EHR platforms
- Medical advice, clinical decision support, or FDA-regulated functionality (regulatory risk)
- Tracking multiple substances beyond Kratom
- Android Wear or Apple Watch apps
- Offline-first architecture (requires network connectivity)
- Multi-language support (English only initially)

**Deferred to Future Phases:**
- Accountability partner features (Phase 2)
- Withdrawal symptom tracking (Phase 2)
- Apple Health / Google Fit integration (Phase 2)
- Provider dashboard and B2B features (Phase 3)
- Telehealth integrations (Phase 3+)
- White-label licensing for treatment centers (Phase 3+)

### Future Considerations

**Phase 2 Enhancements (Q3-Q4 2026):**
- **Accountability Partners**: Invite trusted contacts to receive anonymous progress updates (no dose details, just "on track" vs. "needs support")
- **Symptom Tracker**: Log withdrawal symptoms (anxiety, insomnia, restlessness) to optimize taper speed
- **Supplement Stack Tracking**: Track complementary substances used for withdrawal management
- **Apple Health Integration**: Sync with HealthKit for holistic view of health trends
- **Advanced Analytics**: Correlate usage patterns with time of day, day of week, life events

**Phase 3 Strategic Expansion (2027):**
- **Provider Dashboard**: SaaS product for addiction counselors to monitor multiple clients with consent
- **Platform Expansion**: Adapt taper framework for nicotine, cannabis, caffeine reduction
- **Research Partnerships**: Anonymized data contributions to academic studies (with IRB approval)
- **Telehealth Integration**: Partner with online therapy platforms for integrated care
- **Corporate Wellness**: B2B offering for companies addressing workplace substance use

**Long-Term Innovation:**
- **AI-Powered Taper Optimization**: Machine learning models that personalize reduction schedules based on withdrawal symptom feedback
- **Wearable Integration**: Detect craving patterns via heart rate variability, sleep disruption
- **Predictive Relapse Prevention**: Identify high-risk moments and trigger just-in-time interventions

---

## Key Stakeholders

**Primary Stakeholder:**
- **Jarad DeLorenzo** - Founder, Developer, Product Owner
  - Solo developer managing all aspects of product development
  - End-to-end responsibility: design, engineering, marketing, customer support
  - Domain expertise: Personal experience with Kratom tapering journey

**Secondary Stakeholders (Community & Advisors):**
- **Beta Users** - Early adopters who provide feedback during development
- **r/quittingkratom Community** - Reddit-based user research and marketing channel
- **Addiction Counselors** - Potential advisors for harm reduction best practices
- **App Store Review Teams** - Apple and Google gatekeepers for distribution

**Future Stakeholders:**
- Healthcare providers (Phase 3)
- Strategic partners in digital health space
- Investors (if seeking funding to accelerate growth)

---

## Constraints and Assumptions

### Constraints

**Budget:**
- Bootstrap project with zero external funding initially
- Minimal monthly operational costs: Firebase (free tier → ~$50/month at scale), domain/hosting (~$20/month), app store fees ($100/year Apple + $25 one-time Google)
- Target: Achieve revenue breakeven by Month 3 post-launch ($150 MRR to cover infra costs)

**Time:**
- Side project development with limited availability (evenings/weekends)
- Target 10-15 hours per week development time
- Launch window: Q1 2026 (ideally by February)

**Technical:**
- Must maintain cross-platform compatibility (iOS, Android, web)
- Firebase dependency limits backend flexibility (acceptable trade-off for speed)
- React Native/Expo framework constrains native functionality (cannot use all device APIs)
- Anonymous auth model limits ability to recover accounts or migrate data

**Regulatory:**
- Cannot make medical claims or position as FDA-regulated medical device
- Must include clear disclaimers that app is not medical advice
- Privacy policy and terms of service required for app store approval
- GDPR/CCPA compliance for user data (even anonymous usage requires consent)

**Market:**
- Niche market limits total addressable market size
- Stigma around Kratom use may limit word-of-mouth growth
- Regulatory uncertainty (potential DEA scheduling could impact user base)

**Personal:**
- Solo developer velocity limits feature development speed
- Lack of formal marketing budget requires organic/content-driven growth
- Customer support must remain manageable for single person

### Assumptions

**User Behavior Assumptions:**
- Users are motivated to reduce/quit and willing to self-track consistently
- Users have smartphones (iOS 13+ or Android 8+) with reliable internet
- Users will tolerate freemium paywall if free tier provides immediate value
- Users prefer privacy over social accountability features

**Market Assumptions:**
- 1-2 million regular Kratom users in US (industry estimates)
- 20-30% of users want to reduce or quit (target: 200-600K potential users)
- Users are spending $50-300/month on Kratom, making $10/month app affordable
- Minimal direct competition in Kratom-specific tracking apps

**Technical Assumptions:**
- Firebase will scale to 100K+ users without performance degradation
- App store approval process will not block substance-related tracking app (precedent: alcohol tracking apps)
- Anonymous auth is sufficient for MVP (no need for email/password accounts)
- React Native will remain viable framework for 2-3 year product lifecycle

**Business Model Assumptions:**
- Freemium conversion rate of 5-10% is achievable (industry standard for health apps)
- Users will prefer monthly ($9.99) or annual ($79.99) subscription over one-time purchase
- Organic growth through Reddit, forums, and SEO can drive initial user base
- Positive user outcomes will generate testimonials and word-of-mouth

**Revenue Assumptions:**
- Monthly churn rate <5% for premium subscribers (sticky product with ongoing value)
- Average customer lifetime of 12-18 months (users quit successfully and churn)
- Lifetime value (LTV) of $100-150 per paying user justifies <$10 acquisition cost

**Risk Mitigation Assumptions:**
- Clear disclaimers and harm reduction positioning will mitigate legal risk
- Anonymous usage data minimizes privacy liability
- Side project allows experimentation without financial pressure to hit aggressive targets

---

## Success Criteria

**Product Success:**
- ✅ App successfully launches on iOS App Store and Google Play Store
- ✅ App maintains 4.5+ star average rating across both stores
- ✅ Zero critical crashes or data loss incidents
- ✅ 90%+ of users can complete dose logging flow without assistance
- ✅ Dose calculations (unit conversion, daily totals) are mathematically accurate 100% of the time

**User Success:**
- ✅ 60%+ of active users achieve measurable reduction (10%+ decrease) within first 30 days
- ✅ 20%+ of users successfully quit entirely (zero doses for 14+ consecutive days) within 90 days
- ✅ 70%+ 30-day retention rate (users return after onboarding)
- ✅ Net Promoter Score (NPS) >40 (users would recommend to others)
- ✅ 50+ positive user testimonials collected within 6 months

**Business Success:**
- ✅ 1,000 free signups within 60 days of launch
- ✅ 5% free-to-paid conversion rate achieved by Month 3
- ✅ $500 MRR by Month 3 (operational breakeven)
- ✅ $3,000 MRR by Month 6
- ✅ <5% monthly subscriber churn rate
- ✅ Positive cash flow (revenue exceeds operational costs) by Month 4

**Market Validation:**
- ✅ Organic app store search rankings in top 10 for "kratom tracker" and related keywords
- ✅ Featured or mentioned in r/quittingkratom community positively
- ✅ Inbound interest from addiction counselors or healthcare providers
- ✅ Zero negative press or regulatory scrutiny

**Personal Success (Founder Goals):**
- ✅ Sustainable side income stream ($2,000+/month MRR) within 12 months
- ✅ Manageable support workload (<5 hours/week)
- ✅ Product operates autonomously without requiring constant hands-on management
- ✅ Positive user feedback affirms meaningful impact on people's lives

**Failure Criteria (Know When to Pivot or Shut Down):**
- ❌ <500 signups after 90 days of launch (insufficient market demand)
- ❌ <2% free-to-paid conversion after 6 months (pricing/value mismatch)
- ❌ <30% 30-day retention (product not sticky enough)
- ❌ App store rejection or removal due to policy violations
- ❌ Regulatory action from FDA, DEA, or state agencies
- ❌ Support burden exceeds 10 hours/week consistently (not sustainable)

---

## Timeline and Milestones

### Target Launch

**Primary Launch:** February 28, 2026 (iOS and Android)
**Secondary Launch:** March 15, 2026 (Web progressive web app)

### Key Milestones

**Phase 0: Pre-Development (Complete)**
- ✅ Initial codebase created with core tracking functionality
- ✅ Firebase backend configured with Firestore and Auth
- ✅ Basic UI components implemented (dose form, gauge, calendar)

**Phase 1: MVP Completion & Launch (January - February 2026)**
- **Week 1-2 (Jan 20 - Feb 2):**
  - Complete BMAD Product Brief and PRD
  - Audit existing codebase for bugs and missing features
  - Fix multi-render issues and dose calculation accuracy
  - Implement data validation and error handling

- **Week 3-4 (Feb 3 - Feb 16):**
  - Design and implement premium paywall (RevenueCat integration)
  - Build smart taper planner algorithm (gradual reduction calculator)
  - Create weekly/monthly analytics charts
  - Implement goal setting and milestone tracking

- **Week 5-6 (Feb 17 - Mar 2):**
  - Enhanced onboarding flow with value demonstration
  - App store assets (screenshots, descriptions, promotional graphics)
  - Privacy policy and terms of service
  - Beta testing with 10-20 users from r/quittingkratom
  - Bug fixes and polish based on beta feedback

- **Week 7 (Mar 3 - Mar 9):**
  - App Store and Google Play submission
  - Marketing content creation (landing page, Reddit posts, SEO articles)
  - Setup analytics and monitoring infrastructure

- **🚀 Launch: March 10, 2026**

**Phase 2: Early Growth & Iteration (March - May 2026)**
- **Month 1 Post-Launch (March):**
  - Monitor app store approval process
  - Respond to initial user feedback and bug reports
  - Publish content marketing (blog posts, Reddit engagement)
  - Target: 500 signups, 25 premium conversions ($250 MRR)

- **Month 2-3 Post-Launch (April - May):**
  - Iterate on onboarding based on drop-off analysis
  - A/B test pricing and paywall positioning
  - Implement push notification reminders
  - Launch referral program (free month for successful referrals)
  - Target: 1,500 total users, 100 premium subscribers ($1,000 MRR)

**Phase 3: Growth & Premium Feature Expansion (June - August 2026)**
- Add accountability partner features (opt-in progress sharing)
- Build withdrawal symptom tracker
- Implement supplement stack tracking
- Launch Apple Health integration
- Target: 5,000 total users, 400 premium subscribers ($4,000 MRR)

**Phase 4: Scale & B2B Exploration (September - December 2026)**
- Pilot provider dashboard with 3-5 addiction counselors
- Evaluate platform expansion to adjacent substances
- Consider strategic partnerships (supplement brands, online therapy platforms)
- Target: 15,000 total users, 1,500 premium subscribers ($15,000 MRR)

**Ongoing Activities (All Phases):**
- Weekly user interviews and feedback sessions
- Bi-weekly feature releases and bug fixes
- Monthly analytics review and strategy adjustment
- Continuous content marketing and community engagement

**Contingency Buffer:**
- Each phase includes 20% time buffer for unexpected bugs, app store delays, or scope changes
- If launch slips beyond March, deprioritize "nice-to-have" features to ship faster

---

## Risks and Mitigation

### Regulatory and Legal Risks

**Risk: App store rejection due to substance-related content**
- **Likelihood:** Medium | **Impact:** Critical
- **Mitigation:**
  - Position as harm reduction tool, not glorification of substance use
  - Include prominent disclaimers: "Not medical advice, consult healthcare provider"
  - Review Apple and Google substance-use policies carefully
  - Precedent: Alcohol tracking apps (DrinkControl, Less) are approved
  - Contingency: If rejected, pivot to web-only progressive web app

**Risk: DEA scheduling of Kratom (currently unscheduled at federal level)**
- **Likelihood:** Low (attempted multiple times, withdrawn) | **Impact:** High
- **Mitigation:**
  - Monitor regulatory news closely
  - Pivot messaging to "herbal supplement reduction" if needed
  - User base established pre-ban would persist (users quitting need tool even more)
  - App framework is substance-agnostic, can expand to other categories

**Risk: Liability claims if user experiences adverse health outcomes**
- **Likelihood:** Low | **Impact:** High
- **Mitigation:**
  - Clear terms of service with liability waivers
  - Prominent disclaimers throughout app: "Not medical advice"
  - Recommend users consult healthcare providers
  - General liability insurance ($500-1,000/year) if revenue justifies
  - Anonymous usage prevents direct user attribution

### Market and Competition Risks

**Risk: Low market demand (users prefer cold turkey or don't want to track)**
- **Likelihood:** Medium | **Impact:** High
- **Mitigation:**
  - Validate demand through r/quittingkratom engagement before launch
  - Beta test with real users to measure retention and engagement
  - Offer generous free tier to reduce adoption friction
  - If demand is insufficient, pivot to multi-substance platform

**Risk: Competitor launches similar app with more resources**
- **Likelihood:** Low (currently no direct competitors) | **Impact:** Medium
- **Mitigation:**
  - First-mover advantage: establish brand and user base quickly
  - Niche focus on Kratom makes market less attractive to generalist competitors
  - Personal story and domain expertise differentiate from corporate competitors
  - Build network effects (user testimonials, community) that are hard to replicate

**Risk: Market too small to sustain business**
- **Likelihood:** Medium | **Impact:** Medium
- **Mitigation:**
  - Conservative projections: 1% of 1M Kratom users = 10K addressable market
  - Even at 1,000 paying users ($10K MRR), provides meaningful side income
  - Platform design allows expansion to nicotine, cannabis, caffeine (much larger markets)
  - Minimum viable success threshold is low (breakeven at $150 MRR)

### Technical Risks

**Risk: Firebase costs scale unpredictably with user growth**
- **Likelihood:** Medium | **Impact:** Medium
- **Mitigation:**
  - Implement efficient Firestore queries (indexed, limited reads)
  - Cache frequently accessed data client-side
  - Monitor costs closely and optimize before they become prohibitive
  - Firebase offers generous free tier (50K reads/day)
  - Contingency: Migrate to self-hosted backend if costs exceed 30% of revenue

**Risk: Data loss or corruption due to bugs**
- **Likelihood:** Low | **Impact:** Critical
- **Mitigation:**
  - Implement comprehensive error handling and validation
  - Firestore provides automatic backups and point-in-time recovery
  - Export functionality allows users to backup their own data
  - Test thoroughly with beta users before wide release

**Risk: React Native/Expo framework limitations or deprecation**
- **Likelihood:** Low | **Impact:** Medium
- **Mitigation:**
  - Expo is well-maintained and widely adopted (low risk of abandonment)
  - Abstract platform-specific code to minimize migration effort
  - Web version provides fallback if mobile platforms become untenable

### Product and User Adoption Risks

**Risk: Poor retention (users don't form habit of tracking)**
- **Likelihood:** High | **Impact:** High
- **Mitigation:**
  - Push notification reminders to log doses
  - Gamification: Streaks, milestones, visual progress celebrations
  - Onboarding emphasizes quick logging (10 seconds)
  - Weekly summary emails with trend analysis to re-engage dormant users

**Risk: Low free-to-paid conversion (users don't see value in premium)**
- **Likelihood:** Medium | **Impact:** High
- **Mitigation:**
  - Design free tier with immediate value but clear upgrade path
  - A/B test paywall positioning and pricing
  - Offer limited-time discounts for early adopters
  - Demonstrate ROI: "$10/month subscription pays for itself if you reduce intake by $10/month"

**Risk: Negative user reviews due to bugs or poor UX**
- **Likelihood:** Medium | **Impact:** High
- **Mitigation:**
  - Comprehensive beta testing before public launch
  - Rapid response to bug reports and user feedback
  - In-app feedback mechanism to capture issues before they become public reviews
  - Request reviews from satisfied users proactively

### Operational Risks

**Risk: Solo developer burnout or inability to sustain project**
- **Likelihood:** Medium | **Impact:** High
- **Mitigation:**
  - Set realistic expectations: Side project, not startup-level intensity
  - Automate repetitive tasks (CI/CD, monitoring, analytics)
  - Limit support burden with comprehensive FAQs and in-app help
  - If successful, consider hiring contractor for customer support

**Risk: Support volume exceeds capacity (solo developer can't handle inquiries)**
- **Likelihood:** Medium (if successful) | **Impact:** Medium
- **Mitigation:**
  - Build self-service help center and FAQs
  - In-app contextual help reduces support tickets
  - Set expectations: "Support responses within 48 hours"
  - If volume is unmanageable, raise prices to reduce user base or hire part-time support

**Risk: Personal motivation wanes if growth is slow**
- **Likelihood:** Medium | **Impact:** Medium
- **Mitigation:**
  - Focus on user impact stories, not just revenue metrics
  - Celebrate small wins: First paying user, first testimonial, first "quit" success
  - Set minimum viable success criteria ($2K MRR) rather than unrealistic hockey-stick growth
  - Remember personal "why": Helping others through lived experience

---

## Next Steps

1. **Create Product Requirements Document (PRD)** - Run `/prd` command to translate this product brief into detailed functional specifications
2. **Conduct user research** (optional but recommended) - Run `/research` to validate assumptions with r/quittingkratom community
3. **Create technical specification** - Run `/tech-spec` to define architecture for premium features and taper algorithm
4. **Sprint planning** - Break down PRD into implementation stories and estimate development timeline

**Immediate Actions:**
- Review and approve this Product Brief
- Identify any missing context or incorrect assumptions
- Prioritize features for MVP vs. premium vs. future phases
- Set up analytics and monitoring infrastructure

---

**This document was created using BMAD Method v6 - Phase 1 (Analysis)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
