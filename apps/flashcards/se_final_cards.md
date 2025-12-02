#flashcards/SE/Final/General
**G.1** *Briefly comment on the difference between traditional and agile models.*
?
**Traditional (Waterfall-like):**
- Linear, sequential
- Heavy documentation
- Stable requirements
- Best for large, predictable, high-reliability projects

**Agile:**
- Iterative, incremental
- Customer collaboration
- Changing requirements
- Best for innovative, uncertain, fast-moving projects
#flashcards/SE/Final/General
**G.2** *Scenario-based model selection.*
?
For each scenario, choose based on:
- Requirements stability
- Project size
- Risk level
- Timeline rigidity
- Customer involvement
- Need for innovation
- Team skill level

**Examples:**
- High risk → Spiral
- Stable, large → Waterfall/UP
- Rapid change → XP/Scrum
- Need quick deliverables → Agile
- Strict traceability → Traditional
#flashcards/SE/Final/L11
**L11.1** *Explain the process of getting ISO certified.*
?
ISO certification does not evaluate the quality of your product; it evaluates whether your process is consistent, repeatable, measurable, and continuously improving.

To obtain ISO certification, an organization must:
- Maintain documentation showing how processes are performed
- Demonstrate continuous improvement (process changes, measurements, comparisons across cycles)
- Provide evidence that processes are visible, repeatable, and measurable
- Undergo external audits verifying that the organization follows and improves its defined processes

Once the auditors see sustained adherence + improvement, certification is granted.
#flashcards/SE/Final/L11
**L11.2** *Briefly describe the 4 steps of Total Quality Management.*
?
1. **Kaizen** - Continuous process improvement; make processes visible, repeatable, and measurable.

2. **Atarimae Hinshitsu** - Examine intangibles (staff turnover, morale, communication) and optimize their influence on quality.

3. **Kansei** - Study how users interact with the product and use that insight to improve user experience.

4. **Miryokuteki Hinshitsu** - Look beyond the product itself to discover new opportunities or value in related areas.
#flashcards/SE/Final/L12
**L12.1** *Briefly explain the difference between an error and a defect.*
?
- **Error**: A problem found before release.
- **Defect**: A problem found after release.

Errors are cheaper to fix; defects cost far more.
#flashcards/SE/Final/L12
**L12.2** *Explain the concept of defect amplification.*
?
If errors are not caught early, they can be propagated forward into later development stages. Each stage may introduce additional errors or make the original one harder and more expensive to fix. Early detection prevents amplification.
#flashcards/SE/Final/L12
**L12.3** *Explain the concept of pair programming, including what motivates this approach.*
?
Pair programming is when two developers work at one machine collaboratively:
- One writes code (driver), the other reviews in real time (observer)
- This encourages continuous review, immediate testing, early error detection, and shared understanding
- Motivated by the principle that continuous review dramatically reduces errors and improves design quality
#flashcards/SE/Final/L12
**L12.4** *Describe the steps of a formal technical review and who participates.*
?
**Participants:**
- Producer (author of the work product)
- Review Leader
- Reviewers
- Recorder

**Steps:**
1. Review leader checks readiness
2. Reviewers prepare individually
3. The review meeting is held (max ~2 hours)
4. Problems are identified (no problem-solving)
5. Recorder documents all issues
6. Producer makes corrections
7. Follow-up ensures changes are complete
#flashcards/SE/Final/L13
**L13.1** *What do we look for when designing a good test?*
?
A good test should:
- Have high probability of finding errors
- Not be redundant
- Represent the best and most challenging test cases
- Be appropriately complex (not too simple or too convoluted)
#flashcards/SE/Final/L13
**L13.2** *Briefly describe white-box versus black-box testing.*
?
**White-box Testing:**
- Tests internal logic of the program
- Ensure every statement and condition executes at least once
- Uses techniques like flow graphs, cyclomatic complexity, and basis path testing

**Black-box Testing:**
- Tests functionality without looking at code
- Based on inputs/outputs and system requirements
- Uses equivalence partitioning, boundary value analysis, scenario/function testing
#flashcards/SE/Final/L13
**L13.3** *Explain the process of Basis Path Testing.*
?
1. Build a flow graph of the program
2. Compute cyclomatic complexity (simple decisions + 1, or enclosed areas + 1)
3. Identify the set of independent paths
4. Create test cases that execute each independent path at least once
#flashcards/SE/Final/L13
**L13.4** *Explain equivalence partitioning and what values to choose.*
?
Divide input data into equivalence classes where all values are treated similarly by the system.

Choose:
- A typical value inside each partition
- Boundary values (min, max, one less, one more)
- Invalid values outside the legal ranges

This ensures broad coverage with minimal tests.
#flashcards/SE/Final/L13
**L13.5** *Explain regression testing.*
?
After changes or fixes, previously passed tests are re-run to ensure no unintended side effects broke existing functionality.
#flashcards/SE/Final/L13
**L13.6** *Explain smoke testing.*
?
Daily or frequent builds are tested with a small suite of high-value tests to detect show-stopper errors early. Used to maintain integration health.
#flashcards/SE/Final/L13
**L13.7** *Explain comparison testing.*
?
Multiple teams independently develop versions of the same system. Each system is fed identical test data, and outputs must match. Used only in ultra-critical systems (e.g., aerospace).
#flashcards/SE/Final/L13
**L13.8** *Explain Top-Down, Bottom-Up, and Sandwich Testing.*
?
**Top-Down:**
- Start with top module
- Replace missing lower modules with stubs (dummy modules that return fixed values)

**Bottom-Up:**
- Start with low-level modules
- Replace higher modules with drivers (dummy code that calls lower modules)

**Sandwich:**
- Combine both approaches, integrating from top and bottom simultaneously
#flashcards/SE/Final/L14
**L14.1** *Describe, in detail, the Waterfall Model, including phases and pros/cons.*
?
**Phases:**
1. Requirements
2. Design
3. Implementation
4. Verification/Testing
5. Maintenance

**Advantages:**
- Clear structure and documentation
- Easy to manage
- Good for stable, well-understood projects

**Disadvantages:**
- Very rigid
- Does not handle changing requirements
- Late discovery of problems
- High cost of change
#flashcards/SE/Final/L14
**L14.2** *Evolutionary vs Throwaway Prototyping.*
?
**Evolutionary Prototyping:**
- Prototype is incrementally refined until it becomes the final system
- Intended to evolve

**Throwaway Prototyping:**
- Prototype is built quickly to clarify requirements and then discarded
- Final system is built from scratch afterward
#flashcards/SE/Final/L14
**L14.3** *Strengths and weaknesses of prototyping.*
?
**Strengths (at least 4):**
- Improves requirement accuracy
- Encourages customer feedback
- Helps uncover misunderstandings early
- Supports innovation
- Provides early visible progress

**Weaknesses (at least 4):**
- Customers may misunderstand prototype limitations
- Risk of releasing incomplete solutions
- Encourages unrealistic expectations ("If you built that fast…")
- Can drain time from actual development
- May lead to poor architecture if prototype becomes real system
#flashcards/SE/Final/L14
**L14.4** *Briefly describe the Spiral Model with pros/cons.*
?
A risk-driven model combining prototyping, iteration, and structured phases.

**Advantages:**
- Excellent for large, high-risk projects
- Explicit risk management
- Flexible and iterative

**Disadvantages:**
- Can lead to oscillation
- Complex to manage
- Requires experienced teams and high customer involvement
#flashcards/SE/Final/L14
**L14.5** *Describe the Unified Process (UP).*
?
**Phases:**
1. Inception (scope, business case, key use cases)
2. Elaboration (architecture, risk resolution)
3. Construction (iterative development)
4. Transition (deployment, training, beta testing)
5. Production (support)

**Advantages:**
- Handles complexity well
- Supports iteration, risk management, and reuse
- Strong architecture focus

**Disadvantages:**
- Heavyweight for small teams
- High learning curve
- Requires disciplined management
#flashcards/SE/Final/L15
**L15.1** *Explain the MOI approach to team leadership.*
?
- **Motivation**: Encourage and energize team members
- **Organization**: Structure tasks, roles, and workflows clearly
- **Innovation**: Promote creativity and new solutions
#flashcards/SE/Final/L15
**L15.2** *Describe the 4 team organizational paradigms.*
?
1. **Closed Paradigm:** Hierarchical; management makes decisions; low team autonomy.

2. **Random Paradigm:** Self-organizing; team members choose roles; high autonomy; innovation-driven.

3. **Open Paradigm:** Mix of closed + random; team communicates freely, management makes big decisions.

4. **Synchronous Paradigm:** Tasks decomposed into many parallel independent units; heavy coordination overhead.
#flashcards/SE/Final/L15
**L15.3** *What are the three generic traditional team organization models?*
?
**Democratic Decentralized:**
- Team solves problems collaboratively
- Consensus-driven
- High morale and innovation
- Poor traceability and slower progress

**Democratic Centralized:**
- Defined leaders
- Team solves problems; leaders assign tasks
- Good balance of creativity and control
- Requires skilled managers

**Controlled Centralized:**
- Strict hierarchy
- Management makes decisions
- Good traceability and control
- Poor morale; stifles creativity
#flashcards/SE/Final/L15
**L15.4** *Explain why setting expectations too high creates toxicity.*
?
Setting goals that cannot be met causes:
- Continuous failure
- Loss of confidence
- Reduced motivation
- Finger-pointing
- Team collapse

People stop trying when success feels impossible. Effective managers set achievable goals with stretch goals for additional motivation.
#flashcards/SE/Final/L16
**L16.1** *Explain continuous innovation.*
?
Constantly evaluating and updating the product based on customer needs; delivering small improvements frequently rather than waiting for a full release.
#flashcards/SE/Final/L16
**L16.2** *Traditional vs Agile focus: compliance vs delivery.*
?
- **Traditional models** emphasize documentation, process compliance, and correctness.
- **Agile models** emphasize delivering working features, customer value, and adaptability.
#flashcards/SE/Final/L16
**L16.3** *Documentation as proof of compliance.*
?
Traditional processes produce heavy documentation to demonstrate:
- Work has been completed
- Requirements were met
- Processes were followed

Documentation becomes a deliverable in itself.
#flashcards/SE/Final/L16
**L16.4** *Budgeting when requirements change constantly.*
?
Agile uses iterations/timeboxes.

Clients pay per iteration, and after each one they decide:
- Was value delivered?
- Should we fund the next iteration?

This avoids committing to a full fixed-price contract upfront.
#flashcards/SE/Final/L16
**L16.5** *Describe timeboxing.*
?
1. Determine the length of the iteration
2. Calculate available developer hours
3. Select the highest-priority features that fit the timebox
4. Deliver a working increment at the end
#flashcards/SE/Final/L17
**L17.1** *Describe a Product Vision Box.*
?
A mock retail package showing:
- Product name
- 3–4 selling points
- Feature overview
- Requirements/constraints

Forces the team to define what truly matters.
#flashcards/SE/Final/L17
**L17.2** *Describe an Elevator Test Statement.*
?
A concise pitch (1–2 minutes):
- Target customer
- Their need
- Key benefit
- Competitor comparison
- Unique differentiator
#flashcards/SE/Final/L17
**L17.3** *Main elements of a Product Data Sheet (at least 6).*
?
- Client/customer list
- Project Manager + Product Manager
- Tradeoff matrix (scope/schedule/resources/quality)
- Product Objective Statement (POS)
- Exploration factor (uncertainty/risk areas)
- Delay cost (cost of missing deadlines)
- Client benefits
- Risk management plan
- Key features or architecture summary
#flashcards/SE/Final/L17
**L17.4** *What goes on a Feature Card?*
?
- Feature name
- Customer-friendly description
- Type (customer-facing or technical)
- Estimated effort
- Requirement uncertainty
- Dependencies
- Acceptance test (defined before building)
#flashcards/SE/Final/L17
**L17.5** *Difference between a deliverable and a milestone.*
?
- **Deliverable**: A working increment from a single small iteration (2–6 weeks).
- **Milestone**: A larger, cohesive delivery of significant functionality (1–3 months).
#flashcards/SE/Final/L17
**L17.6** *Prioritizing features: what comes first?*
?
1. Dependencies
2. Risk
3. Customer value
#flashcards/SE/Final/L17
**L17.7** *Explain "self-managing teams."*
?
Teams decide:
- Who works on what
- How work is organized
- How to meet iteration goals

No micromanagement.
#flashcards/SE/Final/L17
**L17.8** *Principle of Frequent Integration.*
?
Integrate and build constantly (often daily).

Goal: catch integration errors early, maintain stability.
#flashcards/SE/Final/L17
**L17.9** *Ruthless Testing.*
?
Continuous, automated, aggressive testing of every change.

Tests are written before development and run constantly.
#flashcards/SE/Final/L17
**L17.10** *Oscillation problem in iterative development.*
?
Teams may repeatedly rework the same feature because:
- Requirements keep shifting
- Product is never "good enough"

Must balance improvement with delivering value.
#flashcards/SE/Final/L18
**L18.1** *Explain Extreme Programming (XP).*
?
XP emphasizes taking good practices to the extreme:
- Short iterations (1–3 weeks)
- Customer on the team
- Story cards
- Simple design
- Continuous integration
- Test-driven development
- Pair programming
- Team code ownership
- Minimal documentation

**Advantages:** High quality, rapid feedback, strong communication, adaptable.

**Disadvantages:** Needs strong developers, not scalable, low documentation.
#flashcards/SE/Final/L18
**L18.2** *Explain Pair Programming (XP).*
?
- Two developers at one machine
- One writes code, the other reviews
- Continuous review → fewer defects
- Good for complex tasks or mentorship

**Downside:** Costs more developer-hours; not ideal for routine tasks.
#flashcards/SE/Final/L18
**L18.3** *Principle of Extremes — give 4 examples.*
?
XP says if something is good, do it more:

1. Testing → Test everything, all the time
2. Code reviews → Continuous reviews
3. Integration → Continuous integration
4. Customer contact → Customer embedded in team
5. Communication → Open workspace + pair programming
#flashcards/SE/Final/L18
**L18.4** *Explain the Scrum model with advantages/disadvantages.*
?
Scrum uses:
- Product backlog
- Sprints (1–4 weeks)
- Sprint planning
- Daily stand-ups
- Sprint review
- Sprint retrospective

**Advantages:**
- Fast adaptation
- Strong team autonomy
- Quick delivery
- Simple structure

**Disadvantages:**
- Requires discipline
- Documentation optional
- Product Owner bottlenecks possible
- Not ideal for huge teams
#flashcards/SE/Final/L18
**L18.5** *Scrum is agnostic on documentation and rigor. Explain.*
?
Scrum does not dictate how much documentation to produce.

Teams decide what is needed; Scrum only requires artifacts essential to the sprint cycle.
#flashcards/SE/Final/L18
**L18.6** *"Bad decisions are better than no decisions." Explain.*
?
In Scrum, decisions should be made quickly (often within an hour).

No decision stalls the team—bad decisions can be fixed later.
#flashcards/SE/Final/L18
**L18.7** *Pigs and Chickens in Scrum.*
?
From an old story:
- **Pigs** = committed (developers, Scrum Master, Product Owner)
- **Chickens** = involved but not committed (stakeholders, observers)

Chickens may attend but cannot speak in stand-ups.
#flashcards/SE/Final/L18
**L18.8** *The 3 questions in daily stand-ups.*
?
1. What did you do yesterday?
2. What will you do today?
3. Are there any impediments?
#flashcards/SE/Final/L18
**L18.9** *Compare XP and Scrum; highlight differences.*
?
**XP:**
- Customer embedded
- Pair programming required
- Continuous integration + continuous testing
- Minimal documentation
- Team code ownership

**Scrum:**
- Product Owner represents customer
- Pairing optional
- Sprints, not continuous flow
- Documentation optional but allowed
- Roles defined (Scrum Master, Product Owner, Team)
#flashcards/SE/Final/L18
**L18.10** *Describe Agile Modeling (AUP) with pros/cons.*
?
A lightweight version of the Unified Process:
- Iterative
- Architecture-driven
- Use-case driven
- Multiple small work products (only as needed)

**Advantages:**
- More flexible than UP
- Scales better than XP
- Balances documentation with agility

**Disadvantages:**
- Still heavier than pure agile
- Requires discipline
#flashcards/SE/Final/L18
**L18.11** *Guidelines of Agile Modeling (at least 4).*
?
- Attack risks early
- Deliver value early and often
- Focus on executable software
- Allow change
- Build simple models
- Use component reuse
- Work as a unified team
#flashcards/SE/Final/L19
**L19.1** *Leadership vs management.*
?
- **Management** handles complexity: planning, organizing, controlling.
- **Leadership** handles change: motivating, inspiring, directing vision.
#flashcards/SE/Final/L19
**L19.2** *Self-organizing adaptive teams.*
?
Teams collectively:
- Distribute work
- Make decisions
- Adjust roles based on needs
- Are accountable as a unit

No single manager micromanages them.
#flashcards/SE/Final/L19
**L19.3** *Responsibilities of an agile team leader.*
?
- Facilitate communication
- Maintain vision
- Remove obstacles
- Ensure accountability
- Align team with customer needs
- Support decision-making
- Coach rather than command
#flashcards/SE/Final/L19
**L19.4** *Division of responsibility between customer team and developer team.*
?
**Customer Team:**
- Defines vision
- Chooses features
- Sets priorities
- Accepts/rejects work

**Developer Team:**
- Designs solutions
- Estimates work
- Builds increments
- Ensures technical quality

**Shared:**
- Requirements conversations
- Understanding value
- Clarifying acceptance criteria
#flashcards/SE/Final/L19
**L19.5** *Explain servant leadership.*
?
A servant leader:
- Puts the team's needs first
- Removes impediments
- Enables team autonomy
- Supports rather than controls

Leadership through service, not authority.
#flashcards/SE/Final/L19
**L19.6** *Participatory vs consensus decision making.*
?
**Participatory:**
- Everyone provides input
- Discussion is collaborative
- Final decision does not require unanimity
- Often a single decision-maker synthesizes input
- Faster, avoids deadlock

**Consensus:**
- Everyone must agree
- Slow
- Risk of stalemate
- Can harm morale if forced

Agile strongly prefers participatory, not consensus.
