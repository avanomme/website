
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
