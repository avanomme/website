

#### Master Algorithm Flash

#flashcards/ML/Algorithms
**1.1** *What is the main idea behind Linear Regression?*
?
Fits a straight line to predict continuous values using least squares.

#flashcards/ML/Algorithms
**1.2** *What are the advantages and disadvantages of Linear Regression?*
?
**Advantages:**
- Simple and interpretable
- Efficient computation
- Works well with linear relationships

**Disadvantages:**
- Sensitive to outliers
- Assumes linearity
- Poor performance with non-linear data

#flashcards/ML/Algorithms
**1.3** *What is the loss function for Linear Regression?*
?
Mean Squared Error (MSE):
J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))²

#flashcards/ML/Algorithms
**2.1** *What is the main idea behind Gradient Descent?*
?
Iteratively adjusts parameters to minimize the cost function by moving in the direction of steepest descent.

#flashcards/ML/Algorithms
**2.2** *What are the advantages and disadvantages of Gradient Descent?*
?
**Advantages:**
- Works for many models
- Simple concept
- Scalable to large datasets

**Disadvantages:**
- Can converge to local minima
- Sensitive to learning rate α
- May require many iterations

#flashcards/ML/Algorithms
**3.1** *What is the main idea behind Logistic Regression?*
?
Uses the sigmoid function to model binary outcomes and outputs probability between 0 and 1.

#flashcards/ML/Algorithms
**3.2** *What is the loss function for Logistic Regression?*
?
Binary Cross-Entropy:
L(h_θ(x), y) = -y log h_θ(x) - (1-y) log(1-h_θ(x))

#flashcards/ML/Algorithms
**3.3** *What are the advantages and disadvantages of Logistic Regression?*
?
**Advantages:**
- Probabilistic interpretation
- Simple and fast
- Good baseline for classification

**Disadvantages:**
- Fails for non-linear separability
- Assumes independence of features

#flashcards/ML/Algorithms
**4.1** *What is the main idea behind Decision Trees (ID3)?*
?
Recursively splits data by attributes that maximize information gain through entropy reduction.

#flashcards/ML/Algorithms
**4.2** *What are the advantages and disadvantages of Decision Trees?*
?
**Advantages:**
- Easy to interpret
- Handles non-linear relations
- Robust to outliers

**Disadvantages:**
- Overfits easily
- Biased toward features with many values

#flashcards/ML/Algorithms
**4.3** *What is the loss/cost function for Decision Trees?*
?
Entropy-based Information Gain:
Entropy(S) = -p₊ log₂ p₊ - p₋ log₂ p₋

#flashcards/ML/Algorithms
**5.1** *What is the main idea behind Random Forests?*
?
Ensemble of decision trees using bagging and feature randomness to reduce overfitting.

#flashcards/ML/Algorithms
**5.2** *What are the advantages and disadvantages of Random Forests?*
?
**Advantages:**
- Reduces overfitting
- Robust to noise
- Good accuracy

**Disadvantages:**
- Computationally heavy
- Less interpretable than single trees

#flashcards/ML/Algorithms
**6.1** *What is the main idea behind K-Means Clustering?*
?
Partitions data into K clusters by minimizing within-cluster variance using iterative assignment and centroid updates.

#flashcards/ML/Algorithms
**6.2** *What are the advantages and disadvantages of K-Means?*
?
**Advantages:**
- Simple and fast
- Easy to implement
- Scales well to large datasets

**Disadvantages:**
- Requires K to be specified
- Sensitive to initialization
- Fails on non-convex clusters

#flashcards/ML/Algorithms
**6.3** *What is the cost function for K-Means Clustering?*
?
Sum of Squared Error (SSE):
J = Σᵢ Σₓ∈Cᵢ ||x - μᵢ||²

#flashcards/ML/Algorithms
**7.1** *What is the main idea behind DBSCAN?*
?
Groups points by density, defining clusters as dense regions separated by sparse regions. No need to predefine K.

#flashcards/ML/Algorithms
**7.2** *What are the advantages and disadvantages of DBSCAN?*
?
**Advantages:**
- Finds arbitrary-shaped clusters
- Robust to noise
- No need to predefine K

**Disadvantages:**
- Struggles with varying densities
- Poor performance in high dimensions

#flashcards/ML/Algorithms
**8.1** *What is the main idea behind PCA (Principal Component Analysis)?*
?
Reduces dimensionality by projecting data to directions (principal components) that maximize variance.

#flashcards/ML/Algorithms
**8.2** *What are the advantages and disadvantages of PCA?*
?
**Advantages:**
- Simplifies models
- Removes noise
- Visualizes high-dimensional data

**Disadvantages:**
- Loses interpretability
- Only captures linear structure

#flashcards/ML/Algorithms
**9.1** *What is the main idea behind Regularization (L2/Ridge)?*
?
Penalizes large coefficients to reduce overfitting by adding a penalty term to the cost function.

#flashcards/ML/Algorithms
**9.2** *What is the cost function for Ridge Regularization?*
?
J(θ) = (1/2m) Σ (h_θ(x^(i)) - y^(i))² + λ Σ θⱼ²

#flashcards/ML/Algorithms
**10.1** *What is the purpose of Cross-Validation (K-Fold)?*
?
Evaluates model generalization by rotating train/test splits, using all data for both training and validation.

#flashcards/ML/Algorithms
**10.2** *What are the advantages and disadvantages of Cross-Validation?*
?
**Advantages:**
- Better performance estimate
- Uses all data
- Reduces variance in evaluation

**Disadvantages:**
- Computationally expensive
- Time-consuming for large datasets

#### Neural Networks and Deep Learning

#flashcards/ML/NeuralNetworks
**11.1** *What is the main idea behind Neural Networks (MLP)?*
?
Layers of neurons apply weighted sums followed by nonlinear activations to approximate complex functions and learn feature hierarchies.

#flashcards/ML/NeuralNetworks
**11.2** *What are the advantages and disadvantages of Neural Networks?*
?
**Advantages:**
- Handles nonlinearities
- Learns feature hierarchies
- Flexible architecture
- Universal function approximator

**Disadvantages:**
- Requires large data
- High compute cost
- Risk of overfitting
- Black-box nature

#flashcards/ML/NeuralNetworks
**11.3** *What does an MLP need to function properly?*
?
- Large labeled datasets
- Non-linear activation functions (ReLU, tanh, sigmoid)
- Proper weight initialization
- Sufficient computational power (GPU)

#flashcards/ML/NeuralNetworks
**11.4** *What is the loss function for MLP classification?*
?
Binary Cross-Entropy:
L = -y log(ŷ) - (1-y) log(1-ŷ)
Used when output activation is Sigmoid.

#flashcards/ML/NeuralNetworks
**11.5** *What is the loss function for MLP regression?*
?
Mean Squared Error (MSE):
L = (1/2m) Σ (h_θ(x^(i)) - y^(i))²

#flashcards/ML/NeuralNetworks
**11.6** *Why do we use deep neural networks?*
?
Deeper networks learn hierarchical representations:
edges → textures → object parts → classes

#flashcards/ML/NeuralNetworks
**11.7** *What is the Sigmoid activation function and what are its characteristics?*
?
**Function:** σ(x) = 1/(1 + e^(-x))
**Characteristics:**
- Smooth and differentiable
- Outputs between 0 and 1
- Causes vanishing gradients in deep networks

#flashcards/ML/NeuralNetworks
**11.8** *What is the Tanh activation function and what are its characteristics?*
?
**Function:** tanh(x) = (e^x - e^(-x))/(e^x + e^(-x))
**Characteristics:**
- Centers data around 0
- Faster convergence than sigmoid
- Still suffers from vanishing gradients

#flashcards/ML/NeuralNetworks
**11.9** *What is the ReLU activation function and what are its characteristics?*
?
**Function:** ReLU(x) = max(0, x)
**Characteristics:**
- Efficient computation
- Non-linear
- Prevents vanishing gradient
- Creates sparse activations
- Most commonly used in modern networks

