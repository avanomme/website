
#### ML Quiz Review - Exact Questions

#flashcards/ML/Quiz/L01
**Q1.1** *In the classification algorithm K-NN, the parameter k determines:*

a) The dimensions of the function space
b) The number of classes
c) The iterations of the algorithm
d) The number of features in the input vector
e) The neighbor examples used to predict the class
?
**e) The neighbor examples used to predict the class** ✓

#flashcards/ML/Quiz/L01
**Q1.2** *Complete: An algorithm is said to _____ from _____ E, with respect to some _____ T, and some _____ measure P, if its performance on T as measured by P _____ with experience E.*
?
An algorithm is said to **learn** from **experience** E, with respect to some **task** T, and some **performance** measure P, if its performance on T as measured by P **improves** with experience E.

#flashcards/ML/Quiz/L01
**Q1.3** *Match each concept to its description:*

- Regression
- Unsupervised learning
- Classification
- Supervised learning

Choices:
- Task of drawing inferences from datasets consisting of input data without labeled responses
- Task of predicting a continuous value given input-output example pairs
- Task of predicting a discrete value given input-output example pairs
- Task of learning a function based on example input-output pairs
?
- **Regression** → Task of predicting a continuous value given input-output example pairs
- **Unsupervised learning** → Task of drawing inferences from datasets consisting of input data without labeled responses
- **Classification** → Task of predicting a discrete value given input-output example pairs
- **Supervised learning** → Task of learning a function based on example input-output pairs

#flashcards/ML/Quiz/L01
**Q1.4** *The notation x(i) refers to:*

a) The prediction of regression for input x
b) The i-th component of a vector
c) The i-th cluster in the data
d) The i-th example from a dataset
e) The prediction of classification for input x
?
**d) The i-th example from a dataset** ✓

#flashcards/ML/Quiz/L02
**Q2.1** *The goal in Linear Regression is to _____ the cost function.*
?
**minimize**

#flashcards/ML/Quiz/L02
**Q2.2** *In Linear Regression, associated to each hypothesis function there is a:*

a) Optimization algorithm
b) Dataset
c) Cost value
d) Training example
e) Notation
?
**c) Cost value** ✓

#flashcards/ML/Quiz/L02
**Q2.3** *Regression should be used when you have data WITHOUT labels.*

a) True
b) False
?
**b) False** ✓

Explanation: Regression is a supervised learning technique that requires labeled data.

#flashcards/ML/Quiz/L02
**Q2.4** *The mean squared error tells you how close a regression line is to a set of points.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L02
**Q2.5** *How many parameters has the hypothesis function in an univariate linear regression problem?*

a) 0
b) 2
c) 1
d) 5
e) 3
?
**b) 2** ✓ (θ₀ and θ₁)

#flashcards/ML/Quiz/L03
**Q3.1** *Match each notation element to its description:*

- x(i)
- n
- m
- x(i)j

Choices:
- input of i-th training example
- Number of features
- Number of training examples
- value of feature j in i-th training example
?
- **x(i)** → input of i-th training example
- **n** → Number of features
- **m** → Number of training examples
- **x(i)j** → value of feature j in i-th training example

#flashcards/ML/Quiz/L03
**Q3.2** *In a univariate linear regression problem, how many variables has the optimization problem solved by gradient descent?*

a) 2 Variables
b) 0 Variables
c) 1 Variable
d) 3 Variables
e) Depends on the problem
?
**a) 2 Variables** ✓ (θ₀ and θ₁)

#flashcards/ML/Quiz/L03
**Q3.3** *When the number of training examples in your dataset is very large you should:*

a) Apply K-NN
b) Reduce your dataset
c) Use the Normal Equation Method
d) Apply Multivariate Linear Regression
e) Use Gradient Descent to minimize the cost function
?
**e) Use Gradient Descent to minimize the cost function** ✓

#flashcards/ML/Quiz/L03
**Q3.4** *In gradient descent the parameter alpha multiplies the partial derivative of the cost function.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L03
**Q3.5** *Match each case with the corresponding cause for gradient descent:*

- Gradient descent will converge to a local optimum
- Gradient descent may take too long to converge
- Gradient descent may not converge or even diverge

Choices:
- If alpha is right
- If alpha is too small
- If alpha is too large
?
- **Gradient descent will converge to a local optimum** → If alpha is right
- **Gradient descent may take too long to converge** → If alpha is too small
- **Gradient descent may not converge or even diverge** → If alpha is too large

#flashcards/ML/Quiz/L03
**Q3.6** *Select the statements that are true about Polynomial Regression:*

a) Allows the model to learn non-linear hypothesis
b) Creates new features based on existing ones
c) Is faster than Linear Regression
d) New features don't need to be scaled
e) Does not require Gradient Descent
?
**Correct answers:**
- **a) Allows the model to learn non-linear hypothesis** ✓
- **b) Creates new features based on existing ones** ✓

#flashcards/ML/Quiz/L03
**Q3.7** *Match the dataset types to their purposes:*

Dataset Types:
- Training set
- Validation set
- Test set

Purposes:
- Used for selecting the best model
- Used for reporting the accuracy of the model
- Used for finding the best parameters values of the model
?
- **Training set** → Used for finding the best parameters values of the model
- **Validation set** → Used for selecting the best model
- **Test set** → Used for reporting the accuracy of the model

#flashcards/ML/Quiz/L03
**Q3.8** *The purpose of feature scaling is to have all the features in a similar scale.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L03
**Q3.9** *In K-fold cross-validation the highest accuracy among the different folds is reported.*

a) True
b) False
?
**b) False** ✓

Explanation: The **average** accuracy across all folds is reported.

#flashcards/ML/Quiz/L05
**Q5.1** *Select true statements about Naive Bayes classifier:*

a) Naive Bayes assumes that attribute values are conditionally independent given the target value
b) Naive Bayes has proven to be effective for text classification
c) When conditional independence is satisfied, Naive Bayes corresponds to MAP classification
d) An unseen instance is classified by computing the class that maximizes the posterior probability
?
**All are correct:**
- **a) Naive Bayes assumes that attribute values are conditionally independent given the target value** ✓
- **b) Naive Bayes has proven to be effective for text classification** ✓
- **c) When conditional independence is satisfied, Naive Bayes corresponds to MAP classification** ✓
- **d) An unseen instance is classified by computing the class that maximizes the posterior probability** ✓

#flashcards/ML/Quiz/L05
**Q5.2** *Assuming that all hypotheses are equally probable a priori is called _____ prior.*
?
**uniform**

#flashcards/ML/Quiz/L05
**Q5.3** *Using Bayesian analysis it can be shown that under certain assumptions any learning algorithm that minimizes the squared error between the prediction and the training data will output a maximum likelihood hypothesis.*

a) True
b) False
?
**a) True** ✓

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

a) ID3 is a recursive algorithm
b) ID3 is a greedy algorithm
c) ID3 favors short hypothesis
?
**All are correct:**
- **a) ID3 is a recursive algorithm** ✓
- **b) ID3 is a greedy algorithm** ✓
- **c) ID3 favors short hypothesis** ✓

#flashcards/ML/Quiz/L06
**Q6.2** *Decision Trees allow representing the learned hypothesis as a set of logic rules.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L06
**Q6.3** *The entropy equation calculates:*
?
**The entropy** (measure of homogeneity/impurity of a dataset)

Formula: H(S) = -Σ p(i) * log₂(p(i))

#flashcards/ML/Quiz/L06
**Q6.4** *Which is the criteria in ID3 for selecting an attribute when constructing the tree?*
?
**The selected attribute maximizes the information gain**

#flashcards/ML/Quiz/L07
**Q7.1** *Is it possible to learn a non-linear decision boundary with Logistic Regression?*

a) No
b) Yes, but it is necessary to add new polynomial features
?
**b) Yes, but it is necessary to add new polynomial features** ✓

#flashcards/ML/Quiz/L07
**Q7.2** *The output of Logistic Regression can be interpreted as a probability.*

a) True
b) False
?
**a) True** ✓ (output is between 0 and 1)

#flashcards/ML/Quiz/L07
**Q7.3** *Logistic Regression is a regression algorithm.*

a) True
b) False
?
**b) False** ✓

Explanation: It's a **classification** algorithm (despite the name!)

#flashcards/ML/Quiz/L07
**Q7.4** *What is the benefit of using the logistic regression cost function?*
?
**It is convex, which guarantees convergence to the global minimum**

#flashcards/ML/Quiz/L07
**Q7.5** *The sigmoid function in logistic regression outputs values between:*
?
**0 and 1**

Formula: σ(z) = 1 / (1 + e^(-z))

#flashcards/ML/Quiz/L09
**Q9.1** *The goal of unsupervised learning is to discover "interesting structures" in the data.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L09
**Q9.2** *Which tasks are performed in unsupervised learning?*

a) Finding groups in the data
b) Reducing the dimensions of the data
c) Discovering correlations among variables in the data
d) Regression analysis
e) Predicting the class
?
**Correct answers:**
- **a) Finding groups in the data** ✓
- **b) Reducing the dimensions of the data** ✓
- **c) Discovering correlations among variables in the data** ✓

#flashcards/ML/Quiz/L09
**Q9.3** *K-means can automatically infer the optimum k from the data.*

a) True
b) False
?
**b) False** ✓

Explanation: k must be specified by the user

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
1. **Assign data instances to nearest mean** (assignment step)
2. **Assign each mean to the centroid of its assigned points** (update step)

#flashcards/ML/Quiz/L10
**Q10.1** *Disadvantages of DBSCAN (select all that apply):*

a) Sensitive to parameters
b) Fails to find clusters with different densities
c) Only applicable to spatial data
d) Ineffective in large dimensions
?
**All are correct:**
- **a) Sensitive to parameters** ✓
- **b) Fails to find clusters with different densities** ✓
- **c) Only applicable to spatial data** ✓
- **d) Ineffective in large dimensions** ✓

#flashcards/ML/Quiz/L10
**Q10.2** *DBSCAN can find clusters of arbitrary shape.*

a) True
b) False
?
**a) True** ✓

#flashcards/ML/Quiz/L10
**Q10.3** *DBSCAN requires specifying the number of clusters.*

a) True
b) False
?
**b) False** ✓

Explanation: DBSCAN determines the number of clusters automatically

#flashcards/ML/Quiz/L10
**Q10.4** *DBSCAN advantages over K-means:*

a) Can find arbitrarily-shaped clusters
b) Robust to outliers
c) Does not require number of clusters to be specified
?
**All are correct:**
- **a) Can find arbitrarily-shaped clusters** ✓
- **b) Robust to outliers** ✓
- **c) Does not require number of clusters to be specified** ✓

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

a) Data visualization
b) Reducing computational cost
c) Removing noise
d) Avoiding overfitting
?
**All are correct:**
- **a) Data visualization** ✓
- **b) Reducing computational cost** ✓
- **c) Removing noise** ✓
- **d) Avoiding overfitting** ✓

#flashcards/ML/Quiz/L11
**Q11.4** *PCA is an unsupervised learning technique.*

a) True
b) False
?
**a) True** ✓

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

a) Sigmoid
b) ReLU (Rectified Linear Unit)
c) Tanh
d) Softmax
?
**All are correct:**
- **a) Sigmoid** ✓ (outputs 0 to 1)
- **b) ReLU** ✓ (Rectified Linear Unit)
- **c) Tanh** ✓ (outputs -1 to 1)
- **d) Softmax** ✓ (for output layer in multi-class classification)

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

a) All zeros
b) Small random values
?
**b) Small random values** ✓

Explanation: Initializing to zero breaks symmetry and prevents learning

#flashcards/ML/Quiz/L13
**Q13.3** *The purpose of the learning rate is to:*
?
**Control the step size in gradient descent**

#flashcards/ML/Quiz/L13
**Q13.4** *Overfitting in neural networks can be prevented by:*

a) Regularization
b) Dropout
c) Early stopping
d) Using more training data
?
**All are correct:**
- **a) Regularization** ✓ (L1/L2 penalty)
- **b) Dropout** ✓ (randomly drop neurons during training)
- **c) Early stopping** ✓ (stop when validation error increases)
- **d) Using more training data** ✓

#flashcards/ML/Quiz/L13
**Q13.5** *The cost function for neural networks is typically:*

a) Convex
b) Non-convex
?
**b) Non-convex** ✓

Explanation: Unlike logistic regression which is convex

#flashcards/ML/Quiz/L14
**Q14.1** *Deep neural networks are characterized by:*
?
**Multiple hidden layers**

#flashcards/ML/Quiz/L14
**Q14.2** *Advantages of deep neural networks include:*

a) Automatic feature learning
b) Better performance on complex tasks
c) Hierarchical feature representation
?
**All are correct:**
- **a) Automatic feature learning** ✓
- **b) Better performance on complex tasks** ✓
- **c) Hierarchical feature representation** ✓

#flashcards/ML/Quiz/L14
**Q14.3** *Challenges with deep neural networks:*

a) Require large amounts of data
b) Computationally expensive
c) Risk of overfitting
d) Difficult to interpret
?
**All are correct:**
- **a) Require large amounts of data** ✓
- **b) Computationally expensive** ✓
- **c) Risk of overfitting** ✓
- **d) Difficult to interpret** ✓ ("black box")

#flashcards/ML/Quiz/L14
**Q14.4** *Deep learning has been particularly successful in:*

a) Image recognition
b) Natural language processing
c) Speech recognition
d) Game playing
?
**All are correct:**
- **a) Image recognition** ✓
- **b) Natural language processing** ✓
- **c) Speech recognition** ✓
- **d) Game playing** ✓ (e.g., AlphaGo)

#flashcards/ML/Quiz/L14
**Q14.5** *Vanishing gradient problem refers to:*
?
**Gradients becoming very small in deep networks, making training difficult**

Why it happens: In very deep networks, gradients can shrink exponentially as they propagate backward through layers, especially with activation functions like sigmoid/tanh.
