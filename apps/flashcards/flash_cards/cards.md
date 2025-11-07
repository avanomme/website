

#### Lecture 1: Introduction to Software Engineering

#flashcards/SE/L01
**1.1**  *It is said that 'software doesn't wear out, but it rusts'. Explain this statement.*
?
	- Software does not physically degrade over time like hardware, which suffers mechanical wear.
    - Instead, software _“rusts”_ when it becomes outdated due to:
        - changes in the environment (e.g., OS updates, hardware changes),
        - evolving user requirements,
        - accumulation of patches and quick fixes.    
    - Without proper maintenance, software becomes brittle or incompatible, even if the code itself hasn’t changed 
    
#flashcards/SE/L01
**1.2**  *"Software is engineered, not manufactured". Explain this statement.*
?
	- Unlike physical goods, software isn’t produced in a manufacturing process.
    - It’s created through engineering—requiring creativity, design, and problem-solving.
    - Once developed, software can be copied at negligible cost; most effort is spent in design, coding, and testing

#flashcards/SE/L01
**1.3**  *Explain, in detail, the typical 'wear rate' (i.e. pattern of error detection) in software that is used for long periods of time.*
?
	- Follows a **bathtub curve**:
        - **Early stage**: High failure rate as defects are discovered after release.
        - **Middle stage**: Stabilization with fewer defects as bugs are fixed.
        - **Late stage**: Failure rate increases again as the software ages and environmental changes introduce new problems

#flashcards/SE/L01
**1.4**  *Software Engineering is a 'layered technology'. Explain this statement.*
?
	- Software Engineering includes multiple interdependent layers:
        - **Tools**: Automated support for the process (e.g., compilers, CASE tools).
        - **Methods**: Technical how-tos for building software (e.g., analysis, design).
        - **Process**: Defines the framework for activities and management.
    - These layers rest on a foundation of **quality focus**
<!--SR:!2025-10-24,3,250-->
    
#flashcards/SE/L01
**1.5**  *Briefly explain each of the typical framework activities.*
?
	- **Communication**: Collaborate with stakeholders to gather requirements.
    - **Planning**: Estimate, schedule, and manage tasks.
    - **Modeling**: Analyze requirements and design a solution.
    - **Construction**: Write and test the code.
    - **Deployment**: Deliver, support, and receive feedback on the software
    
#flashcards/SE/L01  
**1.6**  *What are three different umbrella activities.*
?
	- **Software Quality Assurance**
    - **Software Configuration Management**
    - **Measurement**
    - Others can include risk management, reusability management, etc.
    
#flashcards/SE/L01       
**1.7**.  *A process framework (or model) is made up of framework activities and umbrella activities. Discuss:*
?
	***1. the difference between a framework activity and an umbrella activity***
		- **Framework activities**: Core phases every software process must follow (e.g., planning, design, implementation).
        - **Umbrella activities**: Ongoing processes that support all framework activities (e.g., quality assurance, documentation).
	***2. list the standard framework activities***
		- Communication, Planning, Modeling, Construction, Deployment
	***3. what each of the framework activities (generally) involves, and***
		- **Communication**: Stakeholder interaction, requirements collection.
        - **Planning**: Define resources, timelines, and milestones.            
        - **Modeling**: Requirements modeling and software architecture design.            
        - **Construction**: Implementation and testing.            
        - **Deployment**: Release, user training, and support.
	***4. some sample umbrella activities.***
		- Risk management, software configuration management, project tracking, documentation, quality assurance
#### Lecture 2: A Brief Introduction to Process Models

#flashcards/SE/L02
**2.1** *Briefly explain the 4 different process flow models (linear, iterative, evolutionary and parallel).*
?
	- **Linear**: Tasks are executed in a strict sequence with no overlap. Once a stage is complete, you don’t revisit it.        
    - **Iterative**: Repetition of processes is allowed; feedback can be incorporated in repeated cycles.        
    - **Evolutionary**: Software evolves over time as new features are added; supports change and growth.        
    - **Parallel**: Tasks are performed simultaneously to reduce time and improve efficiency

#flashcards/SE/L02
**2.2** *Briefly explain the function of process assessment organizations like ISO.*
?
	- Evaluate and improve software process quality.
    - Examples:
        - **SPICE (ISO/IEC 15504)**: Assists in objectively evaluating software processes.
        - **ISO 9001:2000**: Generic quality standard applicable to software organizations

#flashcards/SE/L02
**2.3** *Describe, in detail, the waterfall method, including identifying and describing the typical phases.*
?
	- **Waterfall Model**: A prescriptive, linear model with distinct, non-overlapping phases:        
        - **Communication**: Initiation and requirements gathering.            
        - **Planning**: Estimation, scheduling, tracking.            
        - **Modeling**: Analysis and design.            
        - **Construction**: Coding and testing.            
        - **Deployment**: Delivery, support, and feedback
	  
#### Lecture 3: Requirements Gathering

#flashcards/SE/L03
**3.1** *Describe, in detail, the 6 steps to requirements gathering: inception, elicitation, elaboration, negotiation, specification, and validation.*
?
	- **Inception**: Establish communication with stakeholders and determine overall goals.        
    - **Elicitation**: Gather requirements through interviews, surveys, and observation.        
    - **Elaboration**: Refine requirements into technical models.        
    - **Negotiation**: Resolve conflicting requirements.        
    - **Specification**: Convert requirements into formal documentations like SRS or use cases.        
    - **Validation**: Review requirements for consistency, completeness, and correctness

#flashcards/SE/L03
**3.2** *Describe, in detail, what the objectives of the first meeting with the client should be.*
?
	- Identify stakeholders.        
    - Define goals, benefits, and business context.        
    - Understand major features and constraints.        
    - Build a preliminary project scope

#flashcards/SE/L03
**3.3** *Describe, in detail, the goals of the Elaboration phase of Requirements Gathering.*
?
	- Build detailed models.        
    - Identify functions, features, classes, relationships, constraints.        
    - Create analysis models for data, functions, behavior, and class structures

#flashcards/SE/L03
**3.4** *What are 5 questions (of the 10 given) that a use case should ask?*
?
	- Who is the primary actor?        
    - What are the actor’s goals?        
    - What preconditions must be true?        
    - What main tasks or functions are performed?        
    - What are the possible alternative or exceptional situations?
	  
#### Lecture 4: Project Management Concepts

#flashcards/SE/L04
**4.1** *What are the main objectives of a Statement of Scope?*
?
	- Define system context.        
    - Specify information objectives and functional/performance requirements.        
    - Ensure the scope is clear to both management and technical teams

#flashcards/SE/L04
**4.2** *A Statement of Scope becomes the starting point for problem decomposition. Explain this statement and what the end objective is in problem decomposition.*
?
	- Once the scope is set, the system is broken down into:        
        - Functions            
        - Data objects            
        - Problem classes                  
    - Goal: Fully define all system components
    
#flashcards/SE/L04
**4.3** *Briefly define 'degree of rigor' with respect to process management.*
?
	- The level of formality and thoroughness applied to the software process.        
    - Influences the selection of tasks, methods, tools, and documentation required
    
#flashcards/SE/L04
**4.4** *Describe, in detail, the process of fitting a process model to a particular project.*
?
	- Define task sets based on:        
        - Activities            
        - Expected work products            
        - Quality checkpoints            
        - Milestones
	  
#### Lecture 5: Process and Project Metrics

#flashcards/SE/L05
**5.1** *Give 3 reasons why we measure project performance.*
?
	- Understand project status.        
    - Identify improvement areas.        
    - Ensure quality assurance and process control

#flashcards/SE/L05
**5.2** *Explain the difference between a metric and a measure. You must define both terms.*
?
	- **Measure**: A direct quantitative value (e.g., LOC, time).
    - **Metric**: A derived value calculated from one or more measures (e.g., defects per KLOC)

#flashcards/SE/L05
**5.3** *What are metrics used for? What should they never be used for?*
?
	- Used for: Project tracking, estimation, quality control.        
    - Should never be used for: Judging individual performance or applying punitive action

#flashcards/SE/L05
**5.4** *Why do we prefer function-based metrics to size-oriented metrics in estimation?*
?
	- Function-based metrics:        
        - More consistent across languages.            
        - Better at reflecting software complexity and user-visible functionality

#flashcards/SE/L05
**5.5** *Give 3 reasons why we prefer Function Points (FPs) to Lines of Code (LoC) as a metric.*
?
	- LoC depends heavily on programming language.        
    - FPs are more stable and objective.        
    - FPs can be determined earlier in the project life cycle

#flashcards/SE/L05
**5.6** *Measurement requires resources and is an investment in the quality of the project. Briefly describe how we go about determining what elements of the project require measurement.*
?
	-  Identify goals of measurement.        
    - Use GQM (Goal-Question-Metric) strategy:        
        - Define a goal.            
        - Ask questions to assess the goal.            
        - Choose metrics to answer questions
	  
#### Lecture 6: Estimation for Software Projects

#flashcards/SE/L06
**6.1** *Describe, in detail, each step of the Project Planning Task Set.*
?
	- **Estimate Scope**: Understand and define what needs to be built.        
    - **Decompose Problem**: Break down the project into smaller, manageable components.        
    - **Assess Risk**: Identify risks that may impact effort, cost, or schedule.        
    - **Select Process Model**: Choose a development model suited to the project.        
    - **Generate Schedule**: Create a timeline with milestones and tasks.        
    - **Estimate Cost**: Determine cost based on time and resources

#flashcards/SE/L06
**6.2** *Give 5 examples of complexity modifiers related to the project as a whole.*
?
	- **Performance constraints**        
    - **Complex processing logic**        
    - **High reliability requirements**        
    - **Unusual data structures**        
    - **Complex user interface requirements**

#flashcards/SE/L06
**6.3** *Explain, in detail, the process of developing an estimate for a project based on function points.*
?
	- Identify external inputs, outputs, inquiries, files, and interfaces.        
    - Assign weightings (simple, average, complex) to each.        
    - Multiply counts by their respective weights and sum for unadjusted FP count.        
    - Apply adjustment factor (based on 14 general system characteristics).        
    - Compute adjusted Function Point total.        
    - Use FP to estimate effort (person-months), cost, and schedule

#flashcards/SE/L06
**6.4** *Explain, in detail, how estimation for Agile projects is done.*
?
	- Use **story points** to estimate relative complexity.        
    - Use **velocity** (amount of work completed in a sprint) to plan future work.        
    - Estimation is collaborative and done iteratively by the team.        
    - Story point values are mapped to effort based on historical team data

#flashcards/SE/L06 
**6.5** *Describe, in detail, the process of the Make-Buy Decision.*
?
	- Evaluate whether to **build software in-house** or **purchase from a vendor**.        
    - Assess cost, time, available solutions, integration needs.        
    - Consider long-term maintenance and support implications.        
    - Involves feasibility analysis and risk assessment
#### Lecture 7: Project Scheduling

#flashcards/SE/L07 
**7.1** *Explain the difference between a deliverable and a milestone.*
?
	- **Deliverable**: A tangible outcome of a task (e.g., design doc, prototype).        
    - **Milestone**: A checkpoint or event that signifies progress (e.g., “Design complete”)

#flashcards/SE/L07 
**7.2** *The relationship between effort and delivery time is not linear -- a project completed too quickly or too slowly will require significantly more resources than one planned correctly. Explain why this is so, including an explanation of what factors multiply efforts in projects completed too quickly or slowly.*
?
	- **Too quickly**:        
        - More people = more communication overhead.            
        - Quality suffers due to shortcuts.          
    - **Too slowly**:        
        - Team fatigue, distractions, and priority drift.            
        - External changes increase risk.
    
#flashcards/SE/L07 
**7.3** *Writing code is actually a minor part of the creation of a large software project. Explain why this is so and include the breakdown of the typical effort allocation in a project.*
?
	- **Coding**: ~20%        
    - **Design, requirements, testing, integration, documentation**: ~80%        
    - Most time is spent in understanding problems, planning, verifying, and refining software
    
#flashcards/SE/L07 
**7.4** *Define a task network (also known as a dependency chart) and what it is used for. Provide a picture as part of your explanation.*
?
	- **task network** shows the logical dependencies among tasks.
    - Nodes = tasks; Arrows = dependencies.        
    - Used for scheduling and critical path analysis.        
    - Since no images are permitted, a simple ASCII example:
    - [Start] → [Design] → [Code] → [Test] → [Deploy]
                           ↘——————→ [Docs]

#flashcards/SE/L07 
**7.5** *Define a Gantt Chart (also known as a Timeline Chart) and what it is used for. Provide a picture as part of your explanation.*
?
	- **Gantt Chart** is a horizontal bar chart showing start and end dates of tasks.
    - Tracks task durations and overlaps.
    - Simple ASCII example:
		Design:  ████████
		Code  :        ████████
		Test  :               ██████
		Deploy:                      ███

#flashcards/SE/L07 
**7.6** *Briefly describe the process of calculating a project's 'burn rate' and what it is used for.*
?
	- **Burn rate** = effort expended per time unit (e.g., hours/week).        
    - Used to monitor how fast the team is consuming budget/time.        
    - Helps assess if the project is on track or needs intervention
	  
#### Lecture 8: Risk Analysis

#flashcards/SE/L08 
**8.1** *Explain the 4 questions that underly risk assessment.*
?
1. **What can go wrong?**    
    → Identify potential project risks or failure scenarios, such as missed deadlines, scope creep, or technology failure.
2. **What is the likelihood it will go wrong?**
    → Estimate the probability of each risk occurring using qualitative (low/medium/high) or quantitative metrics based on past data or expert judgment.
3. **What will the damage be if it does?**
    → Assess the impact on budget, schedule, quality, or customer satisfaction—e.g., will it cause delay, rework, or client loss?
4. **What can be done to reduce the likelihood or mitigate the damage?**
    → Plan mitigation strategies (e.g., prototypes, training, fallback options) or contingency responses to handle the risk if it materializes.

#flashcards/SE/L08 
**8.2** *Explain, in detail, reactive and proactive risk assessment, the differences between them, and which approach we prefer (and why).*
?
	- **Reactive**:        
        - Risk management is triggered **after** problems occur.            
        - Focus on damage control.                    
    - **Proactive**:        
        - Risks identified and handled **before** they occur.            
        - Involves risk identification, projection, and mitigation planning.                    
    - **Preferred**: Proactive — prevents damage instead of reacting to it

#flashcards/SE/L08 
**8.3** *Describe, in detail, the 4 steps to risk projection.*
?
	- **Estimate risk impact** (low/med/high)        
    - **Assess probability** of risk occurrence.        
    - **Determine consequences** (technical, cost, schedule, etc.).        
    - **Rank risks** based on exposure (risk = probability × impact)

#flashcards/SE/L08 
**8.4** *Describe, in detail, the process of building a RMMM plan. In doing so, you must define each of the Ms.*
?
	- **Risk Mitigation**: Prevent the risk (e.g., better training, prototypes).        
    - **Risk Monitoring**: Track risks and indicators during the project.        
    - **Risk Management**: Act if the risk occurs (damage control, contingency)
	  
#### Lecture 9: Design

#flashcards/SE/L09 
**9.1** *What is the purpose of a Use Case Diagram?*
?
	- Visually model functional requirements.        
    - Shows actors and their interactions with system use cases

#flashcards/SE/L9 
**9.2** *What is the purpose of an Activity Diagram?*
?
	- Model workflow and logic of operations.        
    - Shows flow of control from activity to activity

#flashcards/SE/L09 
**9.3** *Briefly describe a CRC model -- what does it contain, what does it describe and what is it used for?*
?
	- **CRC** = Class, Responsibilities, Collaborators.        
    - Describes:        
        - What each class does (responsibilities).            
        - Which classes it works with (collaborators).                   
    - Used in OO design to plan class behavior and interactions

#flashcards/SE/L09 
**9.4** *What is the purpose of a Sequence Diagram?*
?
	- Model dynamic behavior between objects over time.        
    - Shows how operations are carried out sequentially

#flashcards/SE/L09 
**9.5** *What is the purpose of a State Diagram?*
?
	- Show states of a system/component and how it transitions due to events

#flashcards/SE/L09 
**9.6** *Why is it important to choose an architecture for a system prior to beginning detailed design (provide 3 reasons)?*
?
	- Affects design decisions.        
    - Helps manage complexity.        
    - Determines performance and scalability boundaries

#flashcards/SE/L09 
**9.7** *Briefly describe Data Centered Architecture.*
?
	- Central data store accessed by independent components.        
    - Components can update/query the data store

#flashcards/SE/L09 
**9.8** *Briefly describe Data Flow Architecture.*
?
	- Input data flows through a network of processing elements.        
    - Each transforms and passes data onward (e.g., pipe and filter)

#flashcards/SE/L09 
**9.9** *Briefly describe Call and Return Architecture.*
?
	- Modules call submodules and get control back.        
    - Top-down hierarchy (e.g., classic structured programming)

#flashcards/SE/L09 
**9.10** *Briefly describe Layered Architecture.*
?
	- Hierarchical layers, each providing services to the one above.        
    - E.g., OS kernel, middleware, application layer

#flashcards/SE/L09 
**9.11** *Discuss the importance of cohesion and coupling in component-level design (you must define each).*
?
	- **Cohesion**: How strongly elements of a component are related.        
        - High cohesion = focused, manageable modules.                    
    - **Coupling**: Degree of dependency between modules.        
        - Low coupling = modules interact minimally, easier to maintain
	  
#### Lecture 10: Architectural Styles

The architectural styles discussed in this lecture are:

#flashcards/SE/L10
**10.1** *Object-Oriented Style*
?
	- **Components**: Objects (data + operations)        
    - **Connectors**: Messages and method invocations        
    - **Style Invariants**:        
        - Objects hide internal representation.            
        - Objects control their own state.                    
    - **Advantages**:        
        - High modularity; objects can evolve independently.            
        - Supports agent-based decomposition.       
    - **Disadvantages**:        
        - Objects must know the identity of servers.            
        - Method calls may have unintended side effects .

#flashcards/SE/L10
**10.2** *Layered Style*
?
	- **Components**: Layers arranged hierarchically.        
    - **Connectors**: Protocols or method calls between adjacent layers.        
    - **Style Rules**:        
        - Each layer serves the one above and uses the one below.            
        - Layers may be opaque or transparent.                    
    - **Advantages**:        
        - High abstraction; simplifies replacement and evolution.            
        - Interfaces can be reused across applications.         
    - **Disadvantages**:        
        - Not suitable for all systems.            
        - May introduce performance issues when layers must be bypassed.            
        - Defining layers at the right level of abstraction is difficult

#flashcards/SE/L10
**10.3** *Client-Server Style*
?
	- **Components**: Clients and servers
	- **Connectors**: Network protocols (e.g., RPC)
	- **Invariants**:
	    - Server unaware of clients
	    - Client must know server        
	- **Advantages**:
	    - Centralized control and data management	    
	- **Disadvantages**:    
	    - Server bottleneck or single point of failure

#flashcards/SE/L10
**10.4** *Data-Flow Style*
?
	-  Split into:		
		***1. Batch-Sequential Style***
		- **Components**: Separate programs run in sequence		    
		- **Connectors**: Human hand, files, or tapes (e.g., “sneaker-net”)		    
		- **Data Elements**: Aggregate data chunks		    
		- **Use case**: Transactional systems (e.g., banking)				
		- **Disadvantages**:		    
		    - Not suited for real-time or interactive applications
		 ***2.Pipe-and-Filter Style***
		- **Components**: Filters (independent data processors)		    
		- **Connectors**: Pipes (stream conduits)		    
		- **Invariants**:		    
		    - Filters are stateless and unaware of other filters		            
		- **Advantages**:		    
		    - Component reuse and modularity		        
		    - Easier to analyze performance (throughput, latency)		        
		    - Supports concurrent execution		        		    
		- **Disadvantages**:		    
		    - Data processing is batch-like		        
		    - May not be optimal for interactive applications		        
		    - Low common denominator for data types

#flashcards/SE/L10
**10.5** *Batch-Sequential Style*
?
	- **Components**: Separate programs run in sequence    
	- **Connectors**: Human hand, files, or tapes (e.g., “sneaker-net”)    
	- **Data Elements**: Aggregate data chunks    
	- **Use case**: Transactional systems (e.g., banking)   
	- **Disadvantages**:    
	    - Not suited for real-time or interactive applications

#flashcards/SE/L10
**10.6** *Pipe and Filter Style*
?
	- **Components**: Filters (independent data processors)	    
	- **Connectors**: Pipes (stream conduits)	    
	- **Invariants**:	    
	    - Filters are stateless and unaware of other filters	        	    
	- **Advantages**:	    
	    - Component reuse and modularity	        
	    - Easier to analyze performance (throughput, latency)	        
	    - Supports concurrent execution	        
	- **Disadvantages**:	    
	    - Data processing is batch-like	        
	    - May not be optimal for interactive applications	        
	    - Low common denominator for data types

#flashcards/SE/L10
**10.7** *Blackboard Style (includes):*
?
	**Components**:	    
		- Central blackboard (shared data structure)	        
	    - Knowledge sources (components operating on the blackboard)	       	    
	- **Connectors**: State changes on blackboard trigger component actions	    
	- **Use case**: AI systems, compilers, integrated environments
	- **Advantages**:	    
	    - Good for problems without clear control flow	        
	- **Disadvantages**:	    
	    - Hard to debug or maintain when logic becomes complex
	  ***1. Rule Based Style***
		- **Components**: Inference engine, user interface, knowledge base    
		- **Connectors**: Shared memory, procedure calls		    
		- **Advantages**:		    
		    - Behavior modified easily by changing rules
		- **Disadvantages**:		    
		    - Complexity when many rules exist and interact
	  ***2. Interpreter Style***
		- **Components**: Interpreter, command set, UI    
		- **Connectors**: Procedure calls, shared state    
		- **Advantages**:    
		    - Supports dynamic behavior and runtime programmability        
		- **Disadvantages**:    
		    - Complex internal state may be hard to track

#flashcards/SE/L10
**10.8** *Mobile Code Style*
?
	- **Summary**: Code is sent as data, then executed remotely    
	- **Components**:	    
	    - Execution dock (receiver and execution environment)	        
	    - Code interpreter/compiler	        	    
	- **Connectors**:	    
	    - Network transmission protocols	        
	- **Data Elements**:	    
	    - Code, state, data	        
	- **Variants**:	    
	    - Code-on-demand, remote evaluation, mobile agents	        
	- **Examples**:	    
	    - JavaScript, ActiveX, embedded macros

#flashcards/SE/L10
**10.9** *Implicit Invocation Style (includes):*
?
	- **Components**: Announcers (event sources), Listeners (handlers)    
	- **Connectors**: Events and associated handlers
	- **Invariants**:	    
	    - Announcers are unaware of listeners	        
	    - Listeners register interest in certain events	        
	- **Advantages**:	    
	    - Encourages component reuse	        
	    - Supports dynamic evolution of the system	        
	- **Disadvantages**:	    
	    - Unclear system structure	        
	    - No control over order or recipients of event handling	        
	    - Unpredictable system behaviour
	  ***1. Publish-Subscribe Style***
		- **Components**: Publishers, subscribers, proxies    
		- **Connectors**: Often message queues or network protocols		    
		- **Data Elements**: Subscriptions and notifications		    
		- **Advantages**:		    
		    - Supports scalable and loosely-coupled systems		        
		- **Disadvantages**:		    
		    - Complexity in managing subscriptions and delivery		        
		    - Delays or message loss possible in async systems    
	  ***2. Event-Based Style***
		- **Similar to Publish-Subscribe**, focused more on event-triggered execution logic

  #flashcards/SE/L10
**10.10** *Peer-to-Peer Style*
?
	- **Components**: Peers (each acts as client and server)    
	- **Connectors**: Network protocols for discovery and communication    
	- **Advantages**:    
	    - Robust to single point failures        
	    - Scales well        
	- **Disadvantages**:    
	    - Discovery and security are more complex
	    - Synchronization issues
	  
For any of these architectural styles, you may be asked to describe the style, including identifying the components, connectors advantages and disadvantages of each. You may also be required to draw a simple diagram of the style.

