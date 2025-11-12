#### Machine Learning Review Cards

#flashcards/ML/Review
**Linear Regression - Complete Overview**
?
**Main Idea:** Linear Regression fits a straight line (or hyperplane in higher dimensions) to your data using the least squares method. It predicts continuous values by finding the best linear relationship between input features and the target variable.

**Advantages:**
- Simple and highly interpretable - you can see exactly how each feature affects the prediction
- Computationally efficient - works well even with large datasets
- Works excellently when there's a true linear relationship in the data
- Provides confidence intervals and statistical significance tests

**Disadvantages:**
- Very sensitive to outliers - a few extreme points can throw off the entire model
- Assumes a linear relationship - performs poorly when the true relationship is non-linear
- Vulnerable to multicollinearity - correlated features can make coefficient estimates unstable
- Assumes homoscedasticity (constant variance of errors)

**Loss Function:** Mean Squared Error (MSE)
`J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))²`

This penalizes larger errors more heavily (squaring the difference), encouraging the model to minimize large mistakes.

#flashcards/ML/Review
**Gradient Descent - Complete Overview**
?
**Main Idea:** Gradient Descent is an iterative optimization algorithm that adjusts model parameters by moving in the direction of steepest descent (negative gradient) of the cost function. Think of it like walking downhill to reach the lowest valley.

**Advantages:**
- Works for many different models - not just linear regression
- Simple and intuitive concept - follow the slope downward
- Scalable to large datasets (especially with stochastic variants)
- Can handle high-dimensional parameter spaces

**Disadvantages:**
- Can get stuck in local minima for non-convex functions
- Very sensitive to learning rate α - too large causes divergence, too small is painfully slow
- May require many iterations to converge
- Requires feature scaling for optimal performance

**Key Parameters:**
- Learning rate (α): Controls step size
- Convergence criteria: When to stop iterating

**Loss Function:** Indirectly minimizes whatever cost function you choose (e.g., MSE for regression, cross-entropy for classification)

#flashcards/ML/Review
**Logistic Regression - Complete Overview**
?
**Main Idea:** Despite its name, Logistic Regression is a classification algorithm. It uses the sigmoid function to squash linear predictions into probabilities between 0 and 1, making it perfect for binary classification problems.

**Advantages:**
- Provides probabilistic interpretation - not just "yes/no" but "how confident"
- Simple, fast, and efficient for linearly separable data
- Excellent baseline classifier - always try this first
- Less prone to overfitting than complex models
- Coefficients show feature importance

**Disadvantages:**
- Fails completely when classes aren't linearly separable
- Assumes independence of features (like all linear models)
- Struggles with complex decision boundaries
- Can underfit when the relationship is highly non-linear

**Loss Function:** Binary Cross-Entropy (Log Loss)
`L(h_θ(x), y) = -y log h_θ(x) - (1-y) log(1-h_θ(x))`

This heavily penalizes confident wrong predictions, encouraging the model to be well-calibrated in its probability estimates.

#flashcards/ML/Review
**Decision Trees (ID3) - Complete Overview**
?
**Main Idea:** Decision Trees recursively split the data by choosing the feature that maximizes information gain (reduces entropy the most). Each split creates a question that divides the data into purer subsets until you reach leaf nodes with predictions.

**Advantages:**
- Extremely interpretable - you can literally draw the decision process
- Handles non-linear relationships naturally - no feature engineering needed
- Robust to outliers - splits are based on thresholds, not distances
- Works with both numerical and categorical data
- No need for feature scaling

**Disadvantages:**
- Overfits very easily - can memorize training data
- Biased toward features with many possible values
- Unstable - small data changes can create completely different trees
- Greedy algorithm - doesn't guarantee globally optimal tree

**Loss Function:** Entropy-based Information Gain
`Entropy(S) = -p₊ log₂ p₊ - p₋ log₂ p₋`
`Information Gain = Entropy(parent) - Σ (weighted) Entropy(children)`

Lower entropy means purer (more homogeneous) nodes.

#flashcards/ML/Review
**Random Forests - Complete Overview**
?
**Main Idea:** Random Forests create an ensemble of decision trees, where each tree is trained on a random subset of data (bagging) and considers only a random subset of features at each split. The final prediction is the majority vote (classification) or average (regression) across all trees.

**Advantages:**
- Dramatically reduces overfitting compared to single decision trees
- Very robust to noise and outliers
- Excellent accuracy out-of-the-box with minimal tuning
- Provides feature importance scores
- Handles missing values well

**Disadvantages:**
- Computationally expensive - training many trees takes time and memory
- Much less interpretable than a single tree - it's a "black box"
- Slower predictions than single trees
- Can still overfit with too many deep trees

**Key Hyperparameters:**
- Number of trees: More is usually better (diminishing returns)
- Max depth: Controls individual tree complexity
- Features per split: Usually √n for classification, n/3 for regression

**Loss Function:** Aggregates the loss from individual trees (entropy or Gini for classification, MSE for regression)

#flashcards/ML/Review
**K-Means Clustering - Complete Overview**
?
**Main Idea:** K-Means partitions data into K clusters by iteratively: (1) assigning each point to its nearest centroid, (2) recomputing centroids as the mean of assigned points. Repeats until convergence (centroids stop moving significantly).

**Advantages:**
- Simple and intuitive algorithm
- Very fast - scales well to large datasets
- Easy to implement from scratch
- Guaranteed to converge (though not necessarily to global optimum)

**Disadvantages:**
- Requires you to specify K beforehand - often unclear what K should be
- Very sensitive to initial centroid placement - use K-means++ initialization
- Fails catastrophically on non-convex (non-spherical) clusters
- Sensitive to outliers - they pull centroids away from true centers
- Assumes clusters are roughly equal size and density

**Loss Function:** Sum of Squared Errors (SSE) - Within-Cluster Variance
`J = Σᵢ Σ_{x∈Cᵢ} ||x - μᵢ||²`

Minimizes the total distance of points from their cluster centers.

**How to choose K:** Elbow method (plot SSE vs K, look for "elbow"), Silhouette score, domain knowledge

#flashcards/ML/Review
**DBSCAN (Density-Based Spatial Clustering) - Complete Overview**
?
**Main Idea:** DBSCAN groups points that are closely packed together (high density) and marks points in sparse regions as outliers. A cluster is a maximal set of density-connected points. Unlike K-Means, you don't specify the number of clusters - it discovers them automatically.

**Advantages:**
- Discovers arbitrarily-shaped clusters (crescents, spirals, etc.)
- Robust to outliers - explicitly marks them as noise
- No need to specify number of clusters K beforehand
- Works well when clusters have different sizes

**Disadvantages:**
- Struggles with varying density clusters - parameters tuned for dense regions fail for sparse ones
- Poor performance in high-dimensional spaces (curse of dimensionality)
- Sensitive to parameter choices (ε and minPts) - requires domain knowledge
- Doesn't work well when clusters have very different densities

**Key Parameters:**
- ε (epsilon): Maximum distance for two points to be considered neighbors
- minPts: Minimum points needed to form a dense region (core point)

**Loss Function:** No explicit loss function - this is a non-parametric algorithm focused on density connectivity, not optimization

#flashcards/ML/Review
**PCA (Principal Component Analysis) - Complete Overview**
?
**Main Idea:** PCA finds new axes (principal components) along which the data varies the most. It projects high-dimensional data onto these directions, effectively reducing dimensionality while preserving maximum variance. The first PC captures the most variance, second PC the next most (and is orthogonal to first), etc.

**Advantages:**
- Reduces dimensionality - makes visualization and computation faster
- Removes correlated features - addresses multicollinearity
- Removes noise - assuming noise is in low-variance directions
- Speeds up downstream machine learning algorithms
- Great for data visualization (plot first 2-3 PCs)

**Disadvantages:**
- Loses interpretability - principal components are combinations of original features
- Only captures linear relationships - misses non-linear structure
- Assumes high variance = high importance (not always true)
- Sensitive to feature scaling - must standardize first
- May remove small-variance but important features

**How It Works:**

1. Standardize the data (mean=0, variance=1 for each feature)
2. Compute covariance matrix
3. Find eigenvectors (directions) and eigenvalues (variance explained)
4. Sort by eigenvalue and keep top k components
5. Project data onto these k components

**Loss Function:** Variance maximization ≡ Minimizing projection error `Σ ||x - (x^T u)u||²`

#flashcards/ML/Review
**Regularization (L2/Ridge Regression) - Complete Overview**
?
**Main Idea:** Regularization adds a penalty term to the loss function that discourages large parameter values. Ridge (L2) adds the sum of squared coefficients, which shrinks coefficients toward zero but keeps all features. This prevents overfitting by reducing model complexity.

**Advantages:**
- Prevents overfitting - especially when you have many features or limited data
- Keeps all features (unlike L1/Lasso which can zero out features)
- Handles multicollinearity well - distributes weight among correlated features
- Makes the model more robust and generalizable

**Disadvantages:**
- May underfit if λ is too large - model becomes too simple
- Doesn't perform feature selection - all features remain (just shrunken)
- Adds a hyperparameter (λ) that needs tuning
- Requires feature scaling to work properly

**Key Parameter:**
- λ (lambda): Regularization strength
  - λ = 0: No regularization (standard regression)
  - λ → ∞: All coefficients → 0
  - Sweet spot: Cross-validation to find optimal λ

**Loss Function:**
`J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))² + λ Σ θⱼ²`

First term: Fit the data well
Second term: Keep coefficients small

#flashcards/ML/Review
**Cross-Validation (K-Fold) - Complete Overview**
?
**Main Idea:** K-Fold Cross-Validation splits your data into K equal parts (folds). Train on K-1 folds and validate on the remaining fold. Repeat K times, rotating which fold is used for validation. Average the K validation scores for a more reliable performance estimate.

**Advantages:**
- Much better performance estimate than single train/test split
- Uses all data for both training and validation - nothing wasted
- Reduces variance in performance estimates
- Helps detect overfitting
- Works well even with limited data

**Disadvantages:**
- Computationally expensive - trains model K times
- Very time-consuming for large datasets or slow algorithms
- Not suitable for time series (unless you use time-series CV)

**Common Choices:**

- K=5 or K=10 are standard
- K=N (Leave-One-Out): Maximum data usage but very slow
- Stratified K-Fold: Maintains class proportions in each fold

**Note:** This is a validation strategy, not a learning algorithm. It doesn't have a loss function - it's a technique for evaluating model performance.

#flashcards/ML/Review
**Neural Networks (MLP - Multilayer Perceptron) - Complete Overview**
?
**Main Idea:** Neural networks consist of layers of neurons (nodes) that apply a weighted sum of inputs followed by a non-linear activation function. Through backpropagation, the network learns these weights to approximate complex functions. Each layer learns increasingly abstract representations.

**Advantages:**
- Handles highly non-linear and complex relationships
- Learns feature hierarchies automatically - no manual feature engineering
- Universal function approximator - can theoretically learn any function
- Flexible architecture - easily adapted to different problems
- State-of-the-art performance on many tasks (vision, NLP, etc.)

**Disadvantages:**
- Requires large amounts of labeled data to train properly
- Computationally expensive - needs GPUs for practical training
- Very prone to overfitting without proper regularization
- Black box - hard to interpret what the model learned
- Many hyperparameters to tune (layers, neurons, learning rate, etc.)
- Sensitive to initialization and random seed

**Requirements:**

- Large labeled datasets (thousands to millions of examples)
- Non-linear activation functions (ReLU, tanh, sigmoid)
- Proper weight initialization (Xavier, He initialization)
- Sufficient computational power (GPU highly recommended)
- Regularization techniques (dropout, L2, batch normalization)

**Loss Functions:**
- **Classification:** Binary Cross-Entropy `L = -y log(ŷ) - (1-y) log(1-ŷ)`
- **Regression:** Mean Squared Error `L = (1/2m) Σ (h_θ(x^(i)) - y^(i))²`

#flashcards/ML/Review
**Deep Learning - Why Go Deep?**
?
**Main Idea:** Deeper networks (many layers) learn hierarchical representations where each layer builds on the previous one. Early layers detect simple patterns, later layers combine them into increasingly complex concepts.

**Hierarchy Example (Vision):**
- Layer 1: Edges and simple shapes (horizontal lines, vertical lines, curves)
- Layer 2: Textures and simple patterns (combinations of edges)
- Layer 3: Object parts (eyes, wheels, windows)
- Layer 4: Complete objects (faces, cars, buildings)
- Layer 5: Scenes and contexts (street scene, indoor room)

**Key Benefits:**
- Each layer learns increasingly abstract features automatically
- Reuses lower-level features for different high-level concepts
- More parameter-efficient than shallow wide networks
- Better captures complex real-world relationships

**Challenges:**
- Vanishing/exploding gradients in very deep networks
- Requires more data to train effectively
- Harder to optimize - more local minima

#flashcards/ML/Review
**Activation Functions - Complete Comparison**
?
**Main Idea:** Activation functions introduce non-linearity into neural networks, allowing them to learn complex patterns. Each function has different characteristics that make it suitable for specific use cases in network architecture.

**Sigmoid:** `σ(x) = 1/(1 + e^(-x))`
- **Output Range:** (0, 1)
- **Advantages:** Smooth and differentiable everywhere, good for output layer in binary classification (probability interpretation)
- **Disadvantages:** Severe vanishing gradient problem (gradients near 0 at extremes), outputs not zero-centered, computationally expensive (exponential)
- **Use Case:** Output layer for binary classification only

**Tanh (Hyperbolic Tangent):** `tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))`
- **Output Range:** (-1, 1)
- **Advantages:** Zero-centered (better than sigmoid), faster convergence than sigmoid
- **Disadvantages:** Still suffers from vanishing gradient (less severe than sigmoid), computationally expensive
- **Use Case:** Hidden layers in shallow networks, better than sigmoid but worse than ReLU

**ReLU (Rectified Linear Unit):** `ReLU(x) = max(0, x)`
- **Output Range:** [0, ∞)
- **Advantages:** Very efficient computation (just thresholding), prevents vanishing gradient for positive inputs, induces sparsity (many neurons output exactly 0), fastest training
- **Disadvantages:** "Dying ReLU" problem (neurons can get stuck outputting 0), not zero-centered, unbounded output
- **Use Case:** Default choice for hidden layers in modern deep networks

**Modern Variants:**
- **Leaky ReLU:** Small negative slope for x < 0 (fixes dying ReLU)
- **ELU:** Smooth negative part (better than Leaky ReLU)
- **Swish/GELU:** Smooth, learned variants (current state-of-the-art)

**Bottom Line:** Use ReLU for hidden layers unless you have a specific reason not to. Use Sigmoid for binary classification output, Softmax for multi-class.
