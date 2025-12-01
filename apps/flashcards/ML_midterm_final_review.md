
Linear Regression




Most important - any algorithm that is learning is a hypothesis function
- the mechanism to do that is different for every algorithm

#### Need cost or loss function to optimize
- optimize reduce error between predictions and the ground truth in supervised learning

### MSE
- L2 sl 17 the MSE is the most important
- its trying to minimize this cost function
- So you have a training set from many samples m (number of rows in tabular data)
- for every sample you sompute prediction - ground truth
- 
#### Base info
- number of samples are you rows
- columns are your features
- your y is your label and not a feature
- so if you had x and y you only have 1 feature and y is your ground truth
- features are characteristics that define your y label

#### Learning
- linear reg learning a line, but it's the data valuse called weights
- this is what you are adjusting
- adjusting weights so the difference between it and ground truth is as close to zero as possible
- this is when it becomes an optimization problem
- sl 17 and 18, 
- need to shift between diff data, best way to do it is using an optimization algorithm

#### Optimization
- gradient descent, updates weights to update the cost function
- so all ML probelms are an optimization problem by definition

Lecture 4

#### training and testing
- when you ahve your dataset, the entire set
- you have to decide how much to train and how must to test
- call function split 20% test and 80% training
- if you use this you are training and adjusting to test set but this is a problem
- we train diff degree poly for linear and try to see which is best
- so we are adjusting the weights based on the test set
	- no longer unseen data or generalization
	- we have picked the model base on comparing against the test set
	- if you do this end up with overfitting
	- have learned a curve of function that goes through every data point and learns the noise

#### Generalization
- how good you do in unseen data
- so we split again for training development and testing
- in classic we call it training validation and testing
- so we use the k-fold crossvalidation with the set for validations and training
- k is a hyperparameter that needs to be tuned
- cross validation for that set divides it in subsets based on the k value
- so k-fold is about validating in training
- no need to split it with this then no need to actually split it
- cross validation returns the average of the k scores

Then save model and use it to do prediction in your test set and that is all you report, the training is all internal

##### Regularization
- optimizing your loss function
- at some point you get too large values of the weights dispropotionately big
- that tends to be overfitting the curve that learns everything
- how do we fix, we penalize those weights or shrink towards 0
- but if we reduce all of them thats underfitting
- we have a way to do this by appling a penalization not doing it randomly, try adn apply a general penalty, every eight of lamba by alphs



#### tyoes
- different types, norm where you can define a disctance, places where you an defin norm but not distance
- norm is element power 2 square root


### Unsupervised learning there is no labels
- idea is to make clusters by grouping clusters
- k-means need to choose upfront number of clusters youa re going to have
- this is the disadvantage, where DBSCAN does better becuase it doesn't need to set clusters
- can't have more clusters or the same amount as in the data set
- K-means adjust centroid until the distance is good
- other disadvantage is when you have non convex points
	- DBSCAN can do this better

DBSCAN
- it's a density algorithm, GOOD WHEN DENSE CLUSTERS
- when not dense and it's sparse it doesnt work
- needs an epsilon, a distance you define between you and your neighbours
- needs how many neighbours I'm going to have
- another advantage it can spot outliers
- deside epsilon and neighbours with elbow method
- compute distance and chose epislon distance base on that


Lecture 11 with slide 17
Know this this
- the linear it's hypothesis function -y
- PCA we are finding projection 
- PCA is made for reducing dimensions by reducing the data
- looking at vectors with 
- computes eigen vectors not choosing the best values



#### Neural networks
x1 x2 ... slide 39 lecture 12
- what is the shape of the bias vector, 
- z= W x X + b, bias is a vector
- this matrix is 2 by 2, 2 metrics and 2 rows
- number of metrics is the unit
- for every unit need 1 wight
- so bias is 1, 2, one dimensional vector and needs 2 values
- go back to w, bias is always delta 0 so need its w value as well
- need to match rows/units it has
- now imaging 3 inputs add x3 and add 2 more units in the hidden
- this is 3, variables, and 4 units so 3x4
- know how many units at the beginning
- Will be Asked this

so x is 2x2 and x is 1x2 so you get a bias value for every connection to units, so 4 units 4 bias values


#### Sigmoidal
- this activates the unit
- now that forward computation
- now backwards and adjust weights
- at the end you trained and saved
- what you save are the weights and the bias
- given new data, you make prediction, you load weights and compute forward again
- this function is not analytic its the combination of weights and all of that mathematical operation
- when you finish a neural network
- so when asked to predict you do that forward again on it with the saved weights and bias
- for every input value you have a theat value + bias and that are your weights which go into a unit, adding more units gives more
- each unit gets full input of theta values
- bias is just 1 value so we just add it, by taking Theat 0 out of the weights
- adding a unit adds another row of theta values

review sigmoid and relu