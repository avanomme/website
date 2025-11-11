

#### Algorithm Review Cards

#flashcards/ML/Review
**Linear Regression - Complete Overview**
?
**Main Idea:** Fits a straight line to predict continuous values using least squares.

**Advantages:**
- Simple, interpretable, efficient
- Works well with linear relationships

**Disadvantages:**
- Sensitive to outliers
- Assumes linearity
- Poor with non-linear data

**Loss Function:** Mean Squared Error (MSE)
J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))²

#flashcards/ML/Review
**Gradient Descent - Complete Overview**
?
**Main Idea:** Iteratively adjusts parameters to minimize cost function.

**Advantages:**
- Works for many models
- Simple concept
- Scalable

**Disadvantages:**
- Can converge to local minima
- Sensitive to learning rate α

**Loss Function:** Indirectly minimizes the chosen cost (e.g., MSE for regression)

#flashcards/ML/Review
**Logistic Regression - Complete Overview**
?
**Main Idea:** Uses the sigmoid function to model binary outcomes; outputs probability between 0 and 1.

**Advantages:**
- Probabilistic interpretation
- Simple and fast
- Good baseline for classification

**Disadvantages:**
- Fails for non-linear separability
- Assumes independence of features

**Loss Function:** Binary Cross-Entropy
L(h_θ(x),y) = -y log h_θ(x) - (1-y) log(1-h_θ(x))

#flashcards/ML/Review
**Decision Trees (ID3) - Complete Overview**
?
**Main Idea:** Recursively splits data by attributes that maximize information gain (entropy reduction).

**Advantages:**
- Easy to interpret
- Handles non-linear relations
- Robust to outliers

**Disadvantages:**
- Overfits easily
- Biased toward features with many values

**Loss Function:** Entropy-based Information Gain
Entropy(S) = -p₊ log₂ p₊ - p₋ log₂ p₋

#flashcards/ML/Review
**Random Forests - Complete Overview**
?
**Main Idea:** Ensemble of decision trees using bagging and feature randomness.

**Advantages:**
- Reduces overfitting
- Robust to noise
- Good accuracy

**Disadvantages:**
- Computationally heavy
- Less interpretable

**Loss Function:** Sum of tree-level entropy or Gini impurity across ensemble

#flashcards/ML/Review
**K-Means Clustering - Complete Overview**
?
**Main Idea:** Partitions data into K clusters by minimizing within-cluster variance.

**Advantages:**
- Simple, fast
- Easy to implement

**Disadvantages:**
- Requires K
- Sensitive to initialization
- Fails on non-convex clusters

**Loss Function:** Sum of Squared Error (SSE)
J = Σᵢ Σₓ∈Cᵢ ||x - μᵢ||²

#flashcards/ML/Review
**DBSCAN - Complete Overview**
?
**Main Idea:** Groups points by density; defines clusters as dense regions separated by sparse regions.

**Advantages:**
- Finds arbitrary-shaped clusters
- Robust to noise
- No need to predefine K

**Disadvantages:**
- Struggles with varying densities
- High-dimensional data issues

**Loss Function:** No explicit loss; objective is maximizing density-connectedness

#flashcards/ML/Review
**PCA (Principal Component Analysis) - Complete Overview**
?
**Main Idea:** Reduces dimensionality by projecting data to directions (principal components) that maximize variance.

**Advantages:**
- Simplifies models
- Removes noise
- Visualizes high-D data

**Disadvantages:**
- Loses interpretability
- Only captures linear structure

**Loss Function:** Variance maximization equivalent to minimizing projection error ||x - (x^T u)u||²

#flashcards/ML/Review
**Regularization (L2/Ridge) - Complete Overview**
?
**Main Idea:** Penalizes large coefficients to reduce overfitting.

**Advantages:**
- Prevents overfitting
- Keeps all features

**Disadvantages:**
- May underfit if λ too large

**Loss Function:**
J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))² + λ Σ θⱼ²

#flashcards/ML/Review
**Cross-Validation (K-Fold) - Complete Overview**
?
**Main Idea:** Evaluates model generalization by rotating train/test splits.

**Advantages:**
- Better performance estimate
- Uses all data

**Disadvantages:**
- Computationally expensive

**Note:** This is a validation strategy, not a model with a loss function

#flashcards/ML/Review
**Neural Networks (MLP) - Complete Overview**
?
**Main Idea:** Layers of neurons apply weighted sums + nonlinear activations to approximate complex functions.

**Advantages:**
- Handles nonlinearities
- Learns feature hierarchies
- Flexible architecture

**Disadvantages:**
- Requires large data
- High compute cost
- Risk of overfitting

**Needs:**
- Large labeled datasets
- Non-linear activation functions
- Proper weight initialization
- GPU computing power

**Loss Functions:**
- Classification: Binary Cross-Entropy L = -y log(ŷ) - (1-y) log(1-ŷ)
- Regression: MSE L = (1/2m) Σ (h_θ(x^(i)) - y^(i))²

#### Deep Learning Concepts

#flashcards/ML/Review
**Why Deep Networks?**
?
Deeper networks learn hierarchical representations:

**Hierarchy:**
edges → textures → object parts → classes

**Key Benefits:**
- Each layer learns increasingly abstract features
- Earlier layers detect basic patterns
- Later layers combine them into complex concepts

#flashcards/ML/Review
**Activation Functions Comparison**
?
**Sigmoid:** σ(x) = 1/(1 + e^(-x))
- Smooth, outputs [0,1]
- Causes vanishing gradients

**Tanh:** tanh(x) = (e^x - e^(-x))/(e^x + e^(-x))
- Centers data at 0
- Faster convergence than sigmoid
- Still has vanishing gradient problem

**ReLU:** ReLU(x) = max(0, x)
- Efficient, non-linear
- Prevents vanishing gradient
- Sparse activation
- Most commonly used in modern networks

