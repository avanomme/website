#flashcards/SE/Final/Lydia/L11
**L11.1** *Explain the process of getting ISO certified.*
?
ISO is known for physical manufacturing - the gold standard for quality assurance.

- 20 requirements that must be present for an effective QA system
- Means the company has followed the processes improvement approach
- Certifies that processes are consistent, repeatable, measurable, and continuously improving

#flashcards/SE/Final/Lydia/L11
**L11.2** *Briefly describe the 4 steps of Total Quality Management.*
?
Japanese style developed by an American:

1. **Kaizen** - Continuous process improvement. Goal is to develop a repeatable + measurable process. Adopt a process model, improve it over time. Every time we do it, try something different and compare to last time.

2. **Atarimae Hinshitsu** - After satisfied with Kaizen, step back and examine external factors that influence process (turnover, material quality, etc). Identify variables affecting building process and what can be done to improve.

3. **Kansei** - Examine user interaction with product. Figure out what customers want and build that. UX - measure people's satisfaction with interaction.

4. **Miryokuteki Hinshitsu** - Once company is satisfied they're building the best product they can with their techniques, start looking to other products they can use the same techniques to build.

#flashcards/SE/Final/Lydia/L12
**L12.1** *Briefly explain the difference between an error and a defect.*
?
- **Error**: Quality problem found BEFORE release
- **Defect**: Quality problem found AFTER release

Errors are cheaper to fix; defects cost far more.

#flashcards/SE/Final/Lydia/L12
**L12.2** *Explain the concept of defect amplification.*
?
Software without review yields more errors/defects.

- Illustrates generation + detection of errors during design and code of software
- If an error persists and is passed to the next step, it gets worse
- Errors not caught early are propagated forward into later development stages
- Each stage may introduce additional errors or make the original one harder and more expensive to fix
- Early detection prevents amplification

#flashcards/SE/Final/Lydia/L12
**L12.3** *Explain the concept of pair programming, including what motivates this approach.*
?
"Two heads are better than one" approach.

- Put two people in front of one computer and have them problem solve together
- One writes code (driver), the other reviews in real time (observer)
- Encourages continuous review, immediate testing, early error detection, and shared understanding
- Motivated by the principle that continuous review dramatically reduces errors and improves design quality

**Issues**: People chit chat, go off task, people start to think alike

#flashcards/SE/Final/Lydia/L12
**L12.4** *Describe the steps of a formal technical review and who participates (the players).*
?
Formal review brings people in from outside to help review.

**Players:**
- **Producer**: The individual who developed the product
- **Review Leader**: Evaluates product for readiness, generates material to review
- **Reviewers**: Spend 1-2 hours reviewing product
- **Recorder**: Records (in writing) all important issues

**Review Meeting**: 3-5 people. If they agree it's a problem, they send it to the team that decides if it gets fixed.

Remember: reviewing THINGS, not PEOPLE.

#flashcards/SE/Final/Lydia/L13
**L13.1** *What do we look for when designing a "good test"?*
?
- High probability of finding an error
- Not redundant
- Best of breed (most effective)
- Neither too complex nor too simple
- Focus on most important parts of code

#flashcards/SE/Final/Lydia/L13
**L13.2** *Briefly describe white-box versus black-box testing, including what each is used for and what techniques are employed.*
?
**White-box Testing:**
- Know internal workings, ensure "all gears" mesh
- All statements/conditions executed at least once
- Tests the internal logic of the program

**Black-box Testing:**
- Run it through: if this value goes in, that value should come out
- Does it function? Does it produce results?
- Check boundary conditions, check where it might be sensitive to input

**Exhaustive testing**: Test every data path (impossible in practice)
- "Bugs lurk in corners" - only possible way is to test everything
- What we do instead is test boundaries

#flashcards/SE/Final/Lydia/L13
**L13.3** *Explain the process of Basis Path Testing.*
?
1. Find **Cyclomatic Complexity** (measure of how many paths in code)
   - Number of different logic paths to test
   - Use flow charts to find simple decisions/enclosed areas

2. Derive test cases from this complexity measure

3. Apply to critical modules

#flashcards/SE/Final/Lydia/L13
**L13.4** *Explain equivalence partitioning and what values within an equivalence partition should be chosen.*
?
We can't test every single possible value, so we find the **boundary conditions** that are likely to cause errors.

- Standard value inputs for "type" of data
- Find something that can represent boundary conditions
- Divide input data into equivalence classes where all members should be treated the same
- Test at boundaries: just below, at, and just above each boundary

#flashcards/SE/Final/Lydia/L13
**L13.5** *Explain the process of Regression Testing.*
?
Re-execution of some subset of tests **every time** to ensure no changes add side effects.

- Write a piece of code, it passes all tests, check it into dev branch
- Once code has been tested + reviewed and accepted, it's considered "done" (version control)
- Keep testing manually OR automated
- Re-execute some tests to ensure no side effects from new changes

#flashcards/SE/Final/Lydia/L13
**L13.6** *Explain the process of Smoke Testing.*
?
"Pushing on wells to see if smoke comes out"

- Rebuild code every day with black box tests automatically running
- Make sure it still works
- Expose errors that will keep it from properly building
- Quick sanity check before more thorough testing

#flashcards/SE/Final/Lydia/L13
**L13.7** *Explain the process of Comparison Testing.*
?
- Separate teams develop independent versions of an application
- All versions tested on same data
- Keep best results

**Note**: Extremely expensive, only used when reliability is critical

#flashcards/SE/Final/Lydia/L13
**L13.8** *Explain Top-Down Integration, Bottom-Up Integration, and Sandwich Testing. Address stubs and drivers.*
?
**Top-Down Integration:**
- Module tested with stubs
- Pieces at top have code, bottom is all empty
- Stubs replaced depth first, one at a time
- Empty code at bottom, testing code at top, work way down

**Bottom-Up Integration:**
- Detailed parts first, empty "drivers" at top
- Drivers invoke code at bottom (details)
- Worker modules grouped into builds/clusters and integrated

**Sandwich Testing:**
- Combination of both approaches
- Meet in the middle

#flashcards/SE/Final/Lydia/L14
**L14.1** *Describe, in detail, the Waterfall Model, including the phases and advantages/disadvantages.*
?
**Phases:** Communication, Planning, Modeling, Construction, Deployment

**Characteristics:**
- Done in sequence, each phase done to completion
- Output of one step goes into next
- Document driven

**Advantages:**
- Cuts down crosstalk with documentation
- Only model that works for big projects
- Clear milestones and deliverables

**Disadvantages:**
- No going back once a phase is complete
- Doesn't handle changing requirements well
- Problems found late are expensive to fix

#flashcards/SE/Final/Lydia/L14
**L14.2** *Describe and explain the differences between evolutionary and throwaway prototyping.*
?
**Prototyping:**
- Not a process model, it's a technique
- Outward appearances + behavior, no function
- UI design, mimic functionality for client feedback
- Used often for interface design

**Evolutionary Prototyping:**
- System grows to final functionality
- Prototype grows to working system
- Brings in risk analysis if spiral, add new pieces to make function
- Good for tackling complex problems, making sure it *could* work

**Throwaway Prototyping:**
- System is developed, approved, then final system built from scratch
- Just for validation of system requirements
- Prototype is discarded after requirements are confirmed

#flashcards/SE/Final/Lydia/L14
**L14.3** *What are the strengths and weaknesses of prototyping (at least 4 of each)?*
?
**Strengths:**
- Give overview of project
- Show client what's likely to be involved
- Improve requirement accuracy
- Get early user feedback
- Reduce development risk
- Validate technical feasibility

**Weaknesses:**
- Extra time spent on it
- Extra money
- Client may think prototype is nearly finished
- May lead to poor design decisions being kept
- Can be hard to throw away

#flashcards/SE/Final/Lydia/L14
**L14.4** *Briefly describe the Spiral Model, including strengths and weaknesses.*
?
Planning + prototyping + testing to completion for each piece of software, QA as well.

- Each cycle gives more complete version of the software
- Build, test, deploy for each piece

**Strengths:**
- Risk considered at all stages
- Prototyping at all stages
- Stepwise, still waterfall-like
- Constantly tracking risk
- Build small by small, make quick prototypes

**Weaknesses:**
- Risk to redo same piece over and over
- Risk management harder because of changes
- Complex to manage
- Requires expertise in risk assessment

#flashcards/SE/Final/Lydia/L14
**L14.5** *Describe, in detail, the Unified Process, including phases and advantages/disadvantages.*
?
Similar to waterfall, unified, linked to UML object model (entities, encapsulations, modularity). Modular decomposition of system, hierarchy of abstractions. Jumping back and forth is usually in early stages.

**Phases:**
1. **Inception**: Development plan roughed out, high-level planning (overlaps with communication + plans)
2. **Elaboration**: Refine, fill in details, look at models. Use case, analysis, design, implementation, deployment. Pound uncertainty out. Jumping between modeling and planning.
3. **Construction**: Analysis and design of modules, coded + acquired, tests developed
4. **Transition**: Beta test phase, support info needed for client to bundle with it. Both construction + deployment (make dev support materials)
5. **Production**: Deployment + monitoring

#flashcards/SE/Final/Lydia/L15
**L15.1** *Explain the MOI approach to team leadership.*
?
- **Motivation**: Encourage tech people to produce to their best ability
- **Organization**: Mold existing processes to enable concept to product
- **Ideas/Innovation**: Encourage people to create, feel creative, and give ideas

#flashcards/SE/Final/Lydia/L15
**L15.2** *Briefly describe the 4 team organizational paradigm approaches.*
?
First 3 correspond to amount of input employees have:

1. **Closed**: Very structured hierarchy of employees. Told what to do and how. Management knows exactly what's going on at all times, can transfer problems.

2. **Random**: Structured on individual initiatives, "self-organizing." Responsibility/authority is team selected. Problem solving is team-based. Hard to trace mistakes to specific people.

3. **Open**: Structure so controlled but still allows team innovation. Manager sees and knows what's going on but team works together.

4. **Synchronous**: Organizes team members to work on pieces of problem with little communication between them. Solving in parallel as much as possible. Working in subgroups that operate independently.

#flashcards/SE/Final/Lydia/L15
**L15.3** *What are the three generic traditional team organization models? Describe each with advantages and disadvantages.*
?
**1. Democratic Decentralized:**
- Decisions reached by consensus, group effort
- Communication horizontal
- Task coordinator appointed for short durations
- Most agile uses this - groups self-manage
- *Advantage*: Good for morale, innovation
- *Disadvantage*: Takes longer, less quality control, can't trace where things went wrong

**2. Democratic Centralized:**
- Defined team lead + secondary leads for subtask
- Problem solving still group, but implementation assigned by leader
- Can trace errors
- *Advantage*: Good for large projects, quality control with communication
- *Disadvantage*: High management skills required

**3. Controlled Centralized:**
- Top-level problem solving, all by management
- Workers told what to do
- All communication is vertical
- Management aware of everything, every decision
- *Advantage*: Fantastic at quality control, assign responsibility to everyone
- *Disadvantage*: Bad for long-term morale, stifles communication/creativity
- "Where people with God complexes go" - old school management

#flashcards/SE/Final/Lydia/L15
**L15.4** *Consistently setting performance expectations too high can lead to a toxic team environment. Explain this statement.*
?
- People assume they can get the most out of their team by constant pushing
- Setting the bar unreasonably high because it forces them to reach for it

**However:**
- Repeated exposure to failure means loss of confidence and low morale
- Set the bar too high, they stop trying when they keep missing it
- Creates toxic environment and actually discourages productivity

**Fix:** Goal + stretch goals (give rewards for stretch goals)

#flashcards/SE/Final/Lydia/L16
**L16.1** *Explain the concept of continuous innovation.*
?
- Constantly shifting the product and end goal because we don't know how project will go
- Deliver on current customer requirements
- Get something out there so the client keeps giving you money
- Adapt to changing needs and market conditions

#flashcards/SE/Final/Lydia/L16
**L16.2** *Traditional process models focus on compliance to process while Agile process models focus on feature delivery. Explain this statement.*
?
**Traditional:**
- Complete whole product before giving it out
- Focus on following the process
- Entire goal is to complete the process correctly

**Agile:**
- Complete small pieces, add activities instead of process compliance
- Complete MVP so client gets immediate value
- Focus on small problems, prioritize most important, streamline process
- Entire goal is to get pieces into production

#flashcards/SE/Final/Lydia/L16
**L16.3** *One of the primary reasons for generating documentation in traditional process models is proving compliance to process. Explain this statement.*
?
- Traditional approach focuses on process because adhering to process ensures quality
- Follow the steps and prove you did what you're supposed to do
- This increases confidence in quality of output
- Documentation proves you did each step correctly
- External auditors can verify compliance

#flashcards/SE/Final/Lydia/L16
**L16.4** *Iterative development in an Agile environment risks constantly changing requirements. How can one negotiate a budget with the client?*
?
- Expectation of change requires less money in design + requirements gathering
- Price for **milestones**, not whole system
- Talk to client about what each piece costs
- Price per unit of development time (iteration or milestone)
- Client pays as they go, can adjust scope based on budget

#flashcards/SE/Final/Lydia/L16
**L16.5** *Describe the process of timeboxing.*
?
Work in sprints:
1. Determine how many devs in this development cycle
2. Determine how many hours each works
3. That determines how many development hours per cycle

Then:
- Grab from box of features
- Fill up schedule until you run out of time
- Use feature list to plan out hours

**Variables:** Length of cycle, hours of development time

#flashcards/SE/Final/Lydia/L17
**L17.1** *Describe a Product Vision Box.*
?
- Vision is high-level document to show selling points and features
- Vision box is a design of the packaging - front + back of box that you'd sell it in

**Purpose:**
- Requirements gathering but not in depth
- Forces you to sit and identify 3-4 most important things
- Prioritization exercise
- Cute little fun thing to show to upper management

#flashcards/SE/Final/Lydia/L17
**L17.2** *Describe an Elevator Test Statement.*
?
Short pitch to show what's really important - identify target, benefit, advantages. Basically, pitch selling points.

**Standard format:**
- Identify target customer
- What needs this product meets
- Which category it falls into
- Key benefit/reason to buy
- Competitive alternative to them
- Statement of "primary differentiation"

**Example (Bounty):** People who clean, it helps them clean up spills, it's a paper towel so cleaning supplies, it cleans up spills *the best*, other brands like Kirkland don't soak up as much spill.

#flashcards/SE/Final/Lydia/L17
**L17.3** *What are the main elements of a Product Data Sheet (at least 6)?*
?
- Identity of customers/clients
- Product manager and project manager (managers on either side you can talk to)
- **Trade-off matrix**: Establishes priority of scope, resources, schedule, and defects
- **Product Objective Statement**: Short statement of scope, schedule, and resources

Also might want:
- Exploration factor
- Delay cost
- Features
- Client benefits
- Performance/quality attributes
- Architecture
- Issues/risks

#flashcards/SE/Final/Lydia/L17
**L17.4** *What information is normally included in a Feature Card?*
?
4x6 recipe card to write feature info, can present to user easily.

**What's on it:**
- Identifier and name
- Description in customer terms
- Feature type (customer/technical)
- Estimated work effort (time, requirements, etc.)
- Requirements of uncertainty (erratic, fluctuating, routine, stable)
- Feature dependencies
- Acceptance tests (how to judge feature is complete, what makes client happy and how to ensure it happens)

#flashcards/SE/Final/Lydia/L17
**L17.5** *Explain the difference between a deliverable and a milestone.*
?
- **Deliverable**: Things to hand to client, working increment at end of sprint
- **Milestone**: 1-3 months long, major point of functionality, contains multiple deliverables

#flashcards/SE/Final/Lydia/L17
**L17.6** *When prioritizing features, what factors should take priority?*
?
Features that are delivered to the client should take priority.

Consider:
- Customer value
- Dependencies
- Risk
- Technical complexity

#flashcards/SE/Final/Lydia/L17
**L17.7** *In the Agile approach, teams are said to be self-managing. Explain what this means.*
?
- Guided by the plan but team decides how to tackle and who does what
- Adjust plan as necessary
- Commit to tasks as part of iteration plan
- Team manages their own workload
- Make decisions as a team
- Foster individual accountability

#flashcards/SE/Final/Lydia/L17
**L17.8** *What is the principle of Frequent Integration and what is it trying to achieve?*
?
- Integrate and test as frequently as possible
- Daily builds find problems early on
- Catch integration issues before they compound
- Maintain a working codebase at all times

#flashcards/SE/Final/Lydia/L17
**L17.9** *Describe the concept of Ruthless Testing.*
?
- Test **during** development, not after
- Automate as much as possible (it'll get done)
- Integrate testing procedures into build procedures
- Catch problems as fast as possible
- Sooner you catch an error, cheaper it is to fix

#flashcards/SE/Final/Lydia/L17
**L17.10** *Describe the problem of oscillation when using iterative development approaches.*
?
- Make iterations without end because requirements constantly shift
- Reworking features constantly
- Going back and forth without making progress

**Prevention:**
- Good vision
- Continuous feedback
- Clear acceptance criteria
- Timeboxing

#flashcards/SE/Final/Lydia/L18
**L18.1** *Explain the Extreme Programming (XP) model, including advantages and disadvantages.*
?
- Low reliance on methodology/documentation
- Oriented to small projects (less than 10 devs, less than a year)
- Oral communication + team oriented
- Customer and devs on same team

**Required work products:** Code and tests. Story cards guide development (index cards with features + details worked with customer).

**Stages:**
1. Exploration (story cards, feasibility study, estimation)
2. Planning (stories, release date, iterations to first release)
3. Productionizing (deployment)
4. Maintenance (enhance, fix, plan next release)

**Advantages:** Simple design, pair programming, "team code ownership" - anyone can change/improve code

**Disadvantages:** Not scalable (only for small projects), requires pair programming

#flashcards/SE/Final/Lydia/L18
**L18.2** *Explain Pair Programming, including advantages and disadvantages.*
?
- Two programmers, one computer, work together while programming
- Pairs might change as tasks change
- One writes code (driver), other reviews (navigator)

**Advantages:**
- Continuous code review
- Knowledge sharing
- Fewer bugs
- Better design decisions

**Disadvantages:**
- Resource intensive (two people on one task)
- Personality conflicts possible
- Can lead to groupthink

#flashcards/SE/Final/Lydia/L18
**L18.3** *Extreme Programming operates under the Principle of Extremes. Explain with at least 4 examples.*
?
"If something is good, lots is better"

Examples:
1. If testing is good → Write tests for everything
2. If code reviews are good → Continuous reviews via pair programming
3. If frequent integration is good → Continuous builds on a dedicated machine
4. If short iterations are good → Make them 1-3 weeks
5. If customer involvement is good → Customer rep on team full-time

#flashcards/SE/Final/Lydia/L18
**L18.4** *Explain the Scrum model, including advantages and disadvantages.*
?
Most popular development model. Basic premise of agile but not as rigid as XP.
- 1-2 week iterations (originally 30 days)

**Structure:**
- Start of every iteration: Two meetings (client priorities/goals chosen, sprint planning - look at backlog)
- End of iteration: Review meeting, demo project, feedback
- Teams: Scrum Master (team leader), Product Owner (customer rep), all others equal (max 7)

**Phases:**
1. Planning: Requirements gathering, estimation, overview design
2. Staging: Plan first iteration, determine overall delivery plan
3. Development: Series of iterations, timeboxing, back and forth with client
4. Release: Piece by piece with training and documentation

**Advantages:** Designed to be flexible, robust base of work products

**Disadvantages:** Decisions made quickly, requires fantastic management

#flashcards/SE/Final/Lydia/L18
**L18.5** *Scrum is said to be agnostic on documentation and rigor. Explain this statement.*
?
**Documentation:** Scrum takes no position on it - doesn't say to use it or not to use it. Use whatever helps for the project.

**Rigor:** How detailed you can get (higher degree of novelty = higher rigor needed).

- Don't follow steps blindly
- Think about if it will help the project
- Scrum leaves this up to the devs and people running the project
- Adapt to what works for your situation

#flashcards/SE/Final/Lydia/L18
**L18.6** *"Bad decisions are better than no decisions." Explain this statement.*
?
- Rather than sit down and talk about it for days, make a decision quickly
- Work on it for a week or two
- If you made the wrong choice, just redo the work
- If you sit around and talk about it for a week, you didn't get anything done
- One of the reasons sprints are so short
- Action over analysis paralysis

#flashcards/SE/Final/Lydia/L18
**L18.7** *Scrum daily stand-up meetings may involve "pigs" and "chickens." Explain this statement.*
?
All the words used are rugby-related.

Based on a joke:
- **Pigs** are developers (committed - have skin in the game)
- **Chickens** are observers (involved but not committed)

People who have skin in the game on a discussion should have more input. People unaffected don't get a say. Pigs get listened to.

#flashcards/SE/Final/Lydia/L18
**L18.8** *What are the 3 questions asked at daily stand-up meetings?*
?
1. What did you do yesterday?
2. What will you do today?
3. Any problems/blockers you have?

#flashcards/SE/Final/Lydia/L18
**L18.9** *Describe both XP and Scrum, then highlight the main differences.*
?
**Scrum:**
- Much more casual, developer-based
- If you think it'll help, do it; if not, don't
- Depends a lot on skills of team lead
- Small iterations, piece by piece delivery

**XP:**
- All communication, team oriented
- Pairs keep each other accountable
- Designated tracker for metrics
- More prescriptive practices

**Key Differences:**
- XP has required practices (pair programming, TDD); Scrum is more flexible
- XP has customer embedded; Scrum has Product Owner
- XP focuses on engineering practices; Scrum focuses on project management

#flashcards/SE/Final/Lydia/L18
**L18.10** *Describe the Agile Modeling (Agile Unified Process) model, including advantages and disadvantages.*
?
UML has 50+ types of required documentation (expensive), but if done right, your project is good.

**Agile Unified:** Same general approach but for every 50+ UML docs, just decide if it adds value. "Here's a toolbox of 50 docs, pick which to use."

**Advantages:**
- Scalable
- Encourages light work but able to use more when needed
- Drive out uncertainty before construction

**Disadvantages:**
- Requires good manager
- Need to know which docs to use and which are useless in situations

#flashcards/SE/Final/Lydia/L18
**L18.11** *What are the guidelines that drive the Agile Modeling model (at least 4)?*
?
- Attack risks early and continuously (kill a project before it wastes resources)
- Deliver value to customer early and often
- Stay focused on developing executable software in early iterations
- Accommodate change early in project
- Provoke and embrace change via early development
- Model with a purpose
- Use multiple models
- Travel light (only keep what adds value)

#flashcards/SE/Final/Lydia/L19
**L19.1** *Explain the difference between leadership and management.*
?
**Leadership** is the "pull" approach:
- How do I *inspire* people to work to their max?
- Focus on results: what did you get done?
- Handles change: motivating, inspiring, directing vision

**Management** is the "stick" approach:
- Depends on control: pushing people, threatening them, tracking and comparing
- Sometimes necessary: high complexity = more control needed
- Poor at handling change, motivating people
- Handles complexity: planning, organizing, controlling

#flashcards/SE/Final/Lydia/L19
**L19.2** *Adaptive teams are self-organizing. Explain what this involves.*
?
- The more people feel they have input in a project (power + engagement), the more they take ownership
- Better work, better production
- Manage their own workload
- Make decisions as a team
- Foster individual accountability
- Teams are judged as a team, therefore blame the team together

#flashcards/SE/Final/Lydia/L19
**L19.3** *What are the primary responsibilities of a team leader in an adaptive/agile team environment?*
?
1. **Get the right people on board**: Organize the right tech/behavioral people, complete control over who's there

2. **Keep vision in mind**: Responsible for reminding team what place they have in vision. Are we on track?

3. **Interaction + communication flow**: Environment where everyone is equal, team lead is as equal as possible

4. **Ensure accountability**: Make sure if people say they'll do something, it gets done on time

5. **Steer not control**: Don't order people around, group effort, push effort in right direction

#flashcards/SE/Final/Lydia/L19
**L19.4** *The division of responsibility between customer team and developer team is important. What are the main issues and responsibilities, and which team handles each?*
?
**Customer Team** (charged with determining features + prioritizing):
- Provide requirements: determine what to build
- Customer is always right
- Product Manager: determine and communicate what to build
- Team: entirely determine features and prioritizing them (define value of each)

**Development Team** (charged with delivering results, build product):
- Explain to client how/how not to build, but don't argue
- Customer is always right
- Project Manager: manage team, deliver results
- Team: individuals to deliver results

#flashcards/SE/Final/Lydia/L19
**L19.5** *Explain the concept of servant leadership.*
?
- Manager should be focused on providing team with resources needed to be productive
- "Role of leaders is to serve the team, not order people around"
- Get them what they need
- Remove obstacles
- Shield team from distractions
- Enable and empower rather than command

#flashcards/SE/Final/Lydia/L19
**L19.6** *Discuss participatory decision making and how it differs from consensus decision making.*
?
How we make decisions in a group where people are equal in decision but not in information.

**Participatory:**
- Everybody participates, gets a chance to state their position
- Everyone gets listened to, talks it out
- Manager decides ultimately (because they get in trouble if wrong)
- Good for quick + effective decisions
- Stages: Framing (who's involved), Making (pick best ideas), Retrospective (what could be better)

**Consensus:**
- "We're gonna talk this out until everybody agrees"
- Could talk until end of time
- If you give people right to veto then take it away - bad
- Bad approach: locked into meetings forever

Agile strongly prefers participatory, not consensus.

#flashcards/SE/Final/Lydia/General
**G.1** *Briefly comment on the difference between traditional (waterfall) and agile processing models.*
?
**Waterfall:**
- Water only flows down, don't go back for clarification
- Each step completed linearly and confined to each step
- Output of one step is input of next (produces deliverables, documentation)
- Target build remains unchanged
- Focus on following process and generating documentation to prove you did

**Agile:**
- Evolutionary style: piece by piece to completion, go back and do each step again
- Build working components to completion
- Do as much requirements gathering as necessary to estimate cost
- Estimates per milestone, forces decomposition
- Target build evolves with project, suited for changing requirements
- Focus on results not the process, highly team-based and communication-based

#flashcards/SE/Final/Lydia/General
**G.2** *For scenario-based questions: what process models are available and when to use each?*
?
**Linear (Waterfall):**
- Don't go back, each step to completion
- Best for: stable requirements, large projects, high reliability needs

**Iterative:**
- Go back for clarification when needed
- Best for: moderately changing requirements

**Evolutionary (Agile):**
- Piece by piece to completion
- Best for: changing requirements, innovation, fast-moving projects

**Parallel:**
- Multiple things at same time, lots of people working simultaneously
- When speed is key
- "This is insane. But sometimes it's necessary"

**Consider:** Requirements stability, project size, risk level, timeline rigidity, customer involvement, need for innovation, team skill level
