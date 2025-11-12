

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

#### Machine Learning

#flashcards/ML/Algorithms/K-NN
**ML.A.1** *In the K-NN classification algorithm, what does the parameter k determine?*
?
	- The number of neighbor examples used to predict the class
	- K-NN is a lazy learning algorithm that uses the k nearest neighbors to classify new instances

#flashcards/ML/Algorithms/K-NN
**ML.A.2** *What are the key characteristics of the K-NN algorithm?*
?
	- **Lazy learning**: Instance-based, no explicit training phase
	- **k parameter**: Determines number of neighbors to consider
	- **Simple but slow**: Easy to understand but can be slow for large datasets
	- **Non-parametric**: Makes no assumptions about data distribution

#flashcards/ML/Algorithms/Linear-Regression
**ML.A.3** *What is the goal in Linear Regression and what does it minimize?*
?
	- **Goal**: Minimize the cost function
	- **Cost function**: Mean squared error (MSE)
	- **Formula**: MSE = (1/m) * Σ (h(x(i)) - y(i))^2
	- Each hypothesis function has an associated cost value

#flashcards/ML/Algorithms/Linear-Regression
**ML.A.4** *How many parameters does the hypothesis function have in univariate linear regression?*
?
	- **2 parameters**: θ₀ (intercept) and θ₁ (slope)
	- **Hypothesis function**: h(x) = θ₀ + θ₁x
	- These parameters are optimized to minimize the cost function

#flashcards/ML/Algorithms/Gradient-Descent
**ML.A.5** *Explain the role of the learning rate (alpha) in gradient descent and what happens when it's too large or too small.*
?
	- **Alpha multiplies** the partial derivative of the cost function in the update rule
	- **If alpha is right**: Gradient descent converges to a local optimum
	- **If alpha is too small**: Convergence is very slow
	- **If alpha is too large**: May not converge or even diverge
	- **Update formula**: θ := θ - α * ∇J(θ)

#flashcards/ML/Algorithms/Gradient-Descent
**ML.A.6** *When should you use Gradient Descent vs Normal Equation Method for linear regression?*
?
	- **Use Gradient Descent when**:
	    - Number of training examples is very large
	    - Want iterative optimization
	    - Features can be in different scales
	- **Normal Equation Method**:
	    - Better for small datasets
	    - Computes solution directly (non-iterative)

#flashcards/ML/Algorithms/Logistic-Regression
**ML.A.7** *Is Logistic Regression a regression or classification algorithm? Explain.*
?
	- **Classification algorithm** (despite the name!)
	- **Output**: Can be interpreted as a probability (between 0 and 1)
	- **Uses**: Sigmoid activation function σ(z) = 1 / (1 + e^(-z))
	- **Decision boundary**: Can learn non-linear boundaries by adding polynomial features
	- **Benefit**: Convex cost function guarantees convergence to global minimum

#flashcards/ML/Algorithms/Naive-Bayes
**ML.A.8** *What are the key assumptions and characteristics of the Naive Bayes classifier?*
?
	- **Key assumption**: Attribute values are conditionally independent given the target value
	- **MAP classification**: When conditional independence is satisfied, corresponds to Maximum A Posteriori
	- **Classification**: Computes the class that maximizes posterior probability
	- **Effective for**: Text classification
	- **Bayes theorem**: P(h|D) = P(D|h) * P(h) / P(D)

#flashcards/ML/Algorithms/Naive-Bayes
**ML.A.9** *Define MAP (Maximum A Posteriori) and uniform prior in Bayesian learning.*
?
	- **MAP**: Maximum A **Posterior** hypothesis
	    - Hypothesis that maximizes P(h|D)
	- **Uniform prior**: Assuming all hypotheses are equally probable a priori
	    - When P(h) is constant for all h
	- **Maximum likelihood**: Under certain assumptions, minimizing squared error yields ML hypothesis

#flashcards/ML/Algorithms/Decision-Trees
**ML.A.10** *What are the key characteristics of the ID3 decision tree algorithm?*
?
	- **Recursive algorithm**: Builds tree top-down
	- **Greedy algorithm**: Makes locally optimal choices at each step
	- **Favors short hypotheses**: Prefers simpler trees
	- **Selection criteria**: Maximizes information gain
	- **Information gain**: IG(S, A) = H(S) - Σ |Sv|/|S| * H(Sv)
	- **Output**: Can be represented as logic rules

#flashcards/ML/Algorithms/Decision-Trees
**ML.A.11** *What does the entropy equation calculate and how is it used in decision trees?*
?
	- **Entropy**: H(S) = -Σ p(i) * log₂(p(i))
	- **Measures**: Homogeneity/impurity of a dataset
	- **Range**: 0 (perfectly homogeneous) to 1 (maximum impurity)
	- **Usage**: ID3 selects attributes that maximize information gain
	- **Information gain**: Reduction in entropy after splitting on an attribute

#flashcards/ML/Algorithms/K-Means
**ML.A.12** *What are the two main operations that K-means repeatedly performs?*
?
	- **Assignment step**: Assign each data instance to the nearest mean (centroid)
	- **Update step**: Assign each mean to the centroid of its assigned points
	- **Note**: K must be specified (cannot be automatically inferred from data)
	- **Finds**: Spherical clusters
	- **sklearn usage**:
	    ```python
	    from sklearn.cluster import KMeans
	    kmeans = KMeans(n_clusters=5)
	    kmeans.fit(X)
	    y_kmeans = kmeans.predict(X)
	    ```

#flashcards/ML/Algorithms/DBSCAN
**ML.A.13** *What are the advantages of DBSCAN over K-means clustering?*
?
	- **Can find arbitrarily-shaped clusters** (not just spherical)
	- **Robust to outliers** (identifies and handles them explicitly)
	- **Does not require number of clusters to be specified**
	- **Point types**:
	    - Core points: ≥ minPts neighbors within eps distance
	    - Border points: Within eps of core point but not core
	    - Outliers: Neither core nor border

#flashcards/ML/Algorithms/DBSCAN
**ML.A.14** *What are the disadvantages of DBSCAN?*
?
	- **Sensitive to parameters** (minPts and eps)
	- **Fails to find clusters with different densities**
	- **Only applicable to spatial data**
	- **Ineffective in large dimensions** (curse of dimensionality)

#flashcards/ML/Algorithms/PCA
**ML.A.15** *What is PCA and what is it used for?*
?
	- **PCA**: Principal Component Analysis
	- **Technique**: Unsupervised dimensionality reduction
	- **Method**: Finds directions of maximum variance
	- **Preprocessing**: Features should be scaled/normalized first
	- **Applications**:
	    - Data visualization
	    - Reducing computational cost
	    - Removing noise
	    - Avoiding overfitting

#flashcards/ML/Algorithms/Neural-Networks
**ML.A.16** *What is a perceptron and what are common activation functions in neural networks?*
?
	- **Perceptron**: Single neuron / linear classifier
	- **Activation functions** (introduce non-linearity):
	    - **Sigmoid**: σ(z) = 1/(1 + e^(-z)), outputs 0 to 1
	    - **ReLU**: Rectified Linear Unit, max(0, z)
	    - **Tanh**: Outputs -1 to 1
	    - **Softmax**: For output layer in multi-class classification
	- **No hidden layers**: Equivalent to logistic regression

#flashcards/ML/Algorithms/Neural-Networks
**ML.A.17** *What is backpropagation and how should neural network weights be initialized?*
?
	- **Backpropagation**: Algorithm for computing gradients of cost function with respect to weights
	- **Weight initialization**: Small random values (NOT all zeros!)
	    - Initializing to zero breaks symmetry and prevents learning
	- **Learning rate**: Controls step size in gradient descent
	- **Cost function**: Typically non-convex for neural networks

#flashcards/ML/Algorithms/Neural-Networks
**ML.A.18** *How can overfitting in neural networks be prevented?*
?
	- **Regularization**: Add penalty term to cost function (L1/L2)
	- **Dropout**: Randomly drop neurons during training
	- **Early stopping**: Stop training when validation error increases
	- **More training data**: Reduce overfitting by having more examples
	- **Simpler architecture**: Fewer layers/neurons

#flashcards/ML/Algorithms/Deep-Learning
**ML.A.19** *What characterizes deep neural networks and what are their advantages?*
?
	- **Characteristic**: Multiple hidden layers
	- **Advantages**:
	    - Automatic feature learning (hierarchical representation)
	    - Better performance on complex tasks
	    - Can learn abstract representations
	- **Successful applications**:
	    - Image recognition
	    - Natural language processing
	    - Speech recognition
	    - Game playing (AlphaGo)

#flashcards/ML/Algorithms/Deep-Learning
**ML.A.20** *What are the challenges with deep neural networks?*
?
	- **Data requirements**: Require large amounts of training data
	- **Computational cost**: Expensive to train
	- **Overfitting risk**: Many parameters can overfit
	- **Interpretability**: Difficult to understand decisions ("black box")
	- **Vanishing gradient problem**: Gradients become very small in deep networks, making training difficult

#flashcards/ML/Review/Fundamentals
**ML.R.1** *Complete the formal definition of machine learning: "An algorithm is said to _____ from _____ E, with respect to some _____ T, and some _____ measure P, if..."*
?
	- An algorithm is said to **learn** from **experience** E, with respect to some **task** T, and some **performance** measure P, if its performance on T as measured by P **improves** with experience E.

#flashcards/ML/Review/Fundamentals
**ML.R.2** *Match each ML concept to its description: Regression, Classification, Supervised Learning, Unsupervised Learning*
?
	- **Regression**: Task of predicting a continuous value given input-output example pairs
	- **Classification**: Task of predicting a discrete value given input-output example pairs
	- **Supervised learning**: Task of learning a function based on example input-output pairs
	- **Unsupervised learning**: Task of drawing inferences from datasets consisting of input data without labeled responses

#flashcards/ML/Review/Notation
**ML.R.3** *Explain the standard ML notation: x(i), n, m, x(i)j*
?
	- **x(i)**: Input of i-th training example from a dataset
	- **n**: Number of features
	- **m**: Number of training examples
	- **x(i)j**: Value of feature j in i-th training example

#flashcards/ML/Review/Fundamentals
**ML.R.4** *True or False: Regression should be used when you have data WITHOUT labels. Also, explain labeled vs unlabeled data.*
?
	- **False**: Regression requires labeled data (supervised learning)
	- **Labeled data**: Data with known outputs/targets (for supervised learning)
	- **Unlabeled data**: Data without outputs/targets (for unsupervised learning)
	- **Regression and Classification**: Both require labeled data

#flashcards/ML/Review/Fundamentals
**ML.R.5** *What is the mean squared error and what does it tell you?*
?
	- **MSE**: Tells you how close a regression line is to a set of points
	- **Formula**: MSE = (1/m) * Σ (h(x(i)) - y(i))^2
	- **Lower MSE**: Better fit to the data
	- **Used as**: Cost function in linear regression

#flashcards/ML/Review/Polynomial-Regression
**ML.R.6** *What are the true statements about Polynomial Regression?*
?
	- **Allows the model to learn non-linear hypotheses**
	- **Creates new features based on existing ones**
	- **False statements**:
	    - NOT faster than Linear Regression
	    - New features DO need to be scaled
	    - DOES require Gradient Descent (or Normal Equation)

#flashcards/ML/Review/Data-Splits
**ML.R.7** *Match the dataset types to their purposes: Training set, Validation set, Test set*
?
	- **Training set**: Used for finding the best parameter values of the model
	- **Validation set**: Used for selecting the best model (hyperparameter tuning)
	- **Test set**: Used for reporting the final accuracy of the model
	- **Important**: Never use test set for model selection!

#flashcards/ML/Review/Feature-Scaling
**ML.R.8** *What is the purpose of feature scaling and when should it be applied?*
?
	- **Purpose**: Have all features in a similar scale
	- **Benefits**:
	    - Gradient descent converges faster
	    - Prevents features with large ranges from dominating
	- **Apply before**:
	    - Gradient descent
	    - K-means
	    - PCA
	    - Neural networks

#flashcards/ML/Review/Cross-Validation
**ML.R.9** *True or False: In K-fold cross-validation, the highest accuracy among the different folds is reported. Explain the correct approach.*
?
	- **False**: The **average** accuracy across all folds is reported
	- **K-fold CV process**:
	    1. Split data into K folds
	    2. Train on K-1 folds, test on remaining fold
	    3. Repeat K times (each fold used as test once)
	    4. Report average performance
	- **Benefits**: More robust estimate, uses all data

#flashcards/ML/Review/Unsupervised-Learning
**ML.R.10** *What is the goal of unsupervised learning and what tasks does it perform?*
?
	- **Goal**: Discover "interesting structures" in unlabeled data
	- **Tasks performed**:
	    - Finding groups/clusters in the data
	    - Reducing dimensions of the data
	    - Discovering correlations among variables
	- **NOT used for**:
	    - Regression analysis (supervised)
	    - Predicting classes (supervised)

#flashcards/ML/Review/K-NN-vs-K-Means
**ML.R.11** *What is the key difference between K-NN and K-means?*
?
	- **K-NN**:
	    - **Supervised** classification algorithm
	    - Uses labeled data
	    - k = number of neighbors for prediction
	    - Lazy learning (no training phase)
	- **K-means**:
	    - **Unsupervised** clustering algorithm
	    - Uses unlabeled data
	    - k = number of clusters to find
	    - Iterative optimization

#flashcards/ML/Review/Forward-Propagation
**ML.R.12** *What is forward propagation in neural networks?*
?
	- **Definition**: Computing the output of the network given an input
	- **Process**:
	    1. Input passes through layers
	    2. Each layer applies weights, biases, and activation functions
	    3. Produces final output/prediction
	- **Contrast with backpropagation**: Forward computes output; backward computes gradients

#### ML Quiz Review - Exact Questions

#flashcards/ML/Quiz/L01
**Q1.1** *In the classification algorithm K-NN, the parameter k determines:*
?
	**The neighbor examples used to predict the class**

#flashcards/ML/Quiz/L01
**Q1.2** *Complete: An algorithm is said to _____ from _____ E, with respect to some _____ T, and some _____ measure P, if its performance on T as measured by P _____ with experience E.*
?
	An algorithm is said to **learn** from **experience** E, with respect to some **task** T, and some **performance** measure P, if its performance on T as measured by P **improves** with experience E.

#flashcards/ML/Quiz/L01
**Q1.3** *Match each concept to its description: Regression, Unsupervised learning, Classification, Supervised learning*
?
	- **Regression** → Task of predicting a continuous value given input-output example pairs
	- **Unsupervised learning** → Task of drawing inferences from datasets consisting of input data without labeled responses
	- **Classification** → Task of predicting a discrete value given input-output example pairs
	- **Supervised learning** → Task of learning a function based on example input-output pairs

#flashcards/ML/Quiz/L01
**Q1.4** *The notation x(i) refers to:*
?
	**The i-th example from a dataset**

#flashcards/ML/Quiz/L02
**Q2.1** *The goal in Linear Regression is to _____ the cost function.*
?
	**minimize**

#flashcards/ML/Quiz/L02
**Q2.2** *In Linear Regression, associated to each hypothesis function there is a:*
?
	**Cost value**

#flashcards/ML/Quiz/L02
**Q2.3** *Regression should be used when you have data WITHOUT labels. (True/False)*
?
	**False** - Regression requires labeled data (it's a supervised learning technique)

#flashcards/ML/Quiz/L02
**Q2.4** *The mean squared error tells you how close a regression line is to a set of points. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L02
**Q2.5** *How many parameters has the hypothesis function in an univariate linear regression problem?*
?
	**2** (θ₀ and θ₁)

#flashcards/ML/Quiz/L03
**Q3.1** *Match each notation element to its description: x(i), n, m, x(i)j*
?
	- **x(i)** → input of i-th training example
	- **n** → Number of features
	- **m** → Number of training examples
	- **x(i)j** → value of feature j in i-th training example

#flashcards/ML/Quiz/L03
**Q3.2** *In a univariate linear regression problem, how many variables has the optimization problem solved by gradient descent?*
?
	**2 Variables** (θ₀ and θ₁)

#flashcards/ML/Quiz/L03
**Q3.3** *When the number of training examples in your dataset is very large you should:*
?
	**Use Gradient Descent to minimize the cost function** (not the Normal Equation Method, which becomes computationally expensive)

#flashcards/ML/Quiz/L03
**Q3.4** *In gradient descent the parameter alpha multiplies the partial derivative of the cost function. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L03
**Q3.5** *Match each case with the corresponding cause for gradient descent:*
?
	- **Gradient descent will converge to a local optimum** → If alpha is right
	- **Gradient descent may take too long to converge** → If alpha is too small
	- **Gradient descent may not converge or even diverge** → If alpha is too large

#flashcards/ML/Quiz/L03
**Q3.6** *Select the statements that are true about Polynomial Regression:*
?
	- **Allows the model to learn non-linear hypothesis** ✓
	- **Creates new features based on existing ones** ✓
	- Is faster than Linear Regression ✗
	- New features don't need to be scaled ✗
	- Does not require Gradient Descent ✗

#flashcards/ML/Quiz/L03
**Q3.7** *Match the corresponding concepts for dataset splits:*
?
	- **Used for selecting the best model** → Validation set
	- **Used for reporting the accuracy of the model** → Test set
	- **Used for finding the best parameters values of the model** → Training set

#flashcards/ML/Quiz/L03
**Q3.8** *The purpose of feature scaling is to have all the features in a similar scale. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L03
**Q3.9** *In K-fold cross-validation the highest accuracy among the different folds is reported. (True/False)*
?
	**False** - The **average** accuracy is reported

#flashcards/ML/Quiz/L05
**Q5.1** *Select true statements about Naive Bayes classifier:*
?
	- **Naive Bayes assumes that attribute values are conditionally independent given the target value** ✓
	- **Naive Bayes has proven to be effective for text classification** ✓
	- **When conditional independence is satisfied, Naive Bayes corresponds to MAP classification** ✓
	- **An unseen instance is classified by computing the class that maximizes the posterior probability** ✓

#flashcards/ML/Quiz/L05
**Q5.2** *Assuming that all hypotheses are equally probable a priori is called _____ prior.*
?
	**uniform** prior

#flashcards/ML/Quiz/L05
**Q5.3** *Using Bayesian analysis it can be shown that under certain assumptions any learning algorithm that minimizes the squared error between the prediction and the training data will output a maximum likelihood hypothesis. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L05
**Q5.4** *Which expression corresponds to the Bayes theorem?*
?
	**P(h|D) = P(D|h) * P(h) / P(D)**

#flashcards/ML/Quiz/L05
**Q5.5** *MAP stands for Maximum A _____ hypothesis.*
?
	**Posterior** (Maximum A Posteriori)

#flashcards/ML/Quiz/L06
**Q6.1** *Select statements that apply to ID3:*
?
	- **ID3 is a recursive algorithm** ✓
	- **ID3 is a greedy algorithm** ✓
	- **ID3 favors short hypothesis** ✓

#flashcards/ML/Quiz/L06
**Q6.2** *Decision Trees allow representing the learned hypothesis as a set of logic rules. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L06
**Q6.3** *The entropy equation calculates:*
?
	**The entropy** (measure of homogeneity/impurity of a dataset)

#flashcards/ML/Quiz/L06
**Q6.4** *Which is the criteria in ID3 for selecting an attribute when constructing the tree?*
?
	**The selected attribute maximizes the information gain**

#flashcards/ML/Quiz/L07
**Q7.1** *Is it possible to learn a non-linear decision boundary with Logistic Regression?*
?
	**Yes, but it is necessary to add new polynomial features**

#flashcards/ML/Quiz/L07
**Q7.2** *The output of Logistic Regression can be interpreted as a probability. (True/False)*
?
	**True** (output is between 0 and 1)

#flashcards/ML/Quiz/L07
**Q7.3** *Logistic Regression is a regression algorithm. (True/False)*
?
	**False** - It's a **classification** algorithm (despite the name!)

#flashcards/ML/Quiz/L07
**Q7.4** *What is the benefit of using the logistic regression cost function?*
?
	**It is convex, which guarantees convergence to the global minimum**

#flashcards/ML/Quiz/L07
**Q7.5** *The sigmoid function in logistic regression outputs values between:*
?
	**0 and 1**

#flashcards/ML/Quiz/L09
**Q9.1** *The goal of unsupervised learning is to discover "interesting structures" in the data. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L09
**Q9.2** *Which tasks are performed in unsupervised learning?*
?
	- **Finding groups in the data** ✓
	- **Reducing the dimensions of the data** ✓
	- **Discovering correlations among variables in the data** ✓
	- Regression analysis ✗
	- Predicting the class ✗

#flashcards/ML/Quiz/L09
**Q9.3** *K-means can automatically infer the optimum k from the data. (True/False)*
?
	**False** - k must be specified by the user

#flashcards/ML/Quiz/L09
**Q9.4** *Correct way to use K-means from sklearn:*
?
	```python
	from sklearn.cluster import KMeans
	kmeans = KMeans(n_clusters=5)
	kmeans.fit(X)
	y_kmeans = kmeans.predict(X)
	```

#flashcards/ML/Quiz/L09
**Q9.5** *What are the two operations that k-means repeatedly performs?*
?
	- **Assign data instances to nearest mean**
	- **Assign each mean to the centroid of its assigned points**

#flashcards/ML/Quiz/L10
**Q10.1** *Disadvantages of DBSCAN (select all that apply):*
?
	- **Sensitive to parameters** ✓
	- **Fails to find clusters with different densities** ✓
	- **Only applicable to spatial data** ✓
	- **Ineffective in large dimensions** ✓

#flashcards/ML/Quiz/L10
**Q10.2** *DBSCAN can find clusters of arbitrary shape. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L10
**Q10.3** *DBSCAN requires specifying the number of clusters. (True/False)*
?
	**False** - DBSCAN determines the number of clusters automatically

#flashcards/ML/Quiz/L10
**Q10.4** *DBSCAN advantages over K-means:*
?
	- **Can find arbitrarily-shaped clusters**
	- **Robust to outliers**
	- **Does not require number of clusters to be specified**

#flashcards/ML/Quiz/L10
**Q10.5** *In DBSCAN with minPts=3 and eps=1, classify points as core, border, or outlier:*
?
	- **Core points**: Points with at least 3 neighbors within eps distance
	- **Border points**: Points within eps of a core point but not core themselves
	- **Outliers**: Points that are neither core nor border

#flashcards/ML/Quiz/L11
**Q11.1** *PCA stands for:*
?
	**Principal Component Analysis**

#flashcards/ML/Quiz/L11
**Q11.2** *PCA reduces dimensionality by:*
?
	**Finding directions of maximum variance**

#flashcards/ML/Quiz/L11
**Q11.3** *The purpose of dimensionality reduction includes:*
?
	- **Data visualization** ✓
	- **Reducing computational cost** ✓
	- **Removing noise** ✓
	- **Avoiding overfitting** ✓

#flashcards/ML/Quiz/L11
**Q11.4** *PCA is an unsupervised learning technique. (True/False)*
?
	**True**

#flashcards/ML/Quiz/L11
**Q11.5** *When applying PCA, features should be:*
?
	**Scaled/normalized first**

#flashcards/ML/Quiz/L12
**Q12.1** *A perceptron is a:*
?
	**Single neuron / linear classifier**

#flashcards/ML/Quiz/L12
**Q12.2** *Activation functions are used to:*
?
	**Introduce non-linearity into the network**

#flashcards/ML/Quiz/L12
**Q12.3** *Common activation functions include:*
?
	- **Sigmoid** (outputs 0 to 1)
	- **ReLU** (Rectified Linear Unit)
	- **Tanh** (outputs -1 to 1)
	- **Softmax** (for output layer in multi-class classification)

#flashcards/ML/Quiz/L12
**Q12.4** *Forward propagation refers to:*
?
	**Computing the output of the network given an input**

#flashcards/ML/Quiz/L12
**Q12.5** *A neural network with no hidden layers is equivalent to:*
?
	**Logistic regression** (for classification)

#flashcards/ML/Quiz/L13
**Q13.1** *Backpropagation is used for:*
?
	**Computing gradients of the cost function with respect to weights**

#flashcards/ML/Quiz/L13
**Q13.2** *Weights should be initialized to:*
?
	**Small random values** (NOT all zeros - this breaks symmetry)

#flashcards/ML/Quiz/L13
**Q13.3** *The purpose of the learning rate is to:*
?
	**Control the step size in gradient descent**

#flashcards/ML/Quiz/L13
**Q13.4** *Overfitting in neural networks can be prevented by:*
?
	- **Regularization** (L1/L2 penalty)
	- **Dropout** (randomly drop neurons during training)
	- **Early stopping** (stop when validation error increases)
	- **Using more training data**

#flashcards/ML/Quiz/L13
**Q13.5** *The cost function for neural networks is typically:*
?
	**Non-convex** (unlike logistic regression which is convex)

#flashcards/ML/Quiz/L14
**Q14.1** *Deep neural networks are characterized by:*
?
	**Multiple hidden layers**

#flashcards/ML/Quiz/L14
**Q14.2** *Advantages of deep neural networks include:*
?
	- **Automatic feature learning**
	- **Better performance on complex tasks**
	- **Hierarchical feature representation**

#flashcards/ML/Quiz/L14
**Q14.3** *Challenges with deep neural networks:*
?
	- **Require large amounts of data**
	- **Computationally expensive**
	- **Risk of overfitting**
	- **Difficult to interpret** ("black box")

#flashcards/ML/Quiz/L14
**Q14.4** *Deep learning has been particularly successful in:*
?
	- **Image recognition**
	- **Natural language processing**
	- **Speech recognition**
	- **Game playing** (e.g., AlphaGo)

#flashcards/ML/Quiz/L14
**Q14.5** *Vanishing gradient problem refers to:*
?
	**Gradients becoming very small in deep networks, making training difficult**

