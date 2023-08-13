AWS CodePipeline is a fully managed service that helps to automate the application’s continuous delivery process. CodePipeline automates the build, test, and deploy phases of your release process every time there is a code change.

In this post, I will show you how to implement the CodePipeline and its components using AWS Cloud Development Kit (CDK). CDK is a great IaC tool that helps to create the infrastructure using your favorite programming language.


Before we jump into the code we need to create a CDK project. In this example, I have used Typescript as the programming language but feel free to use your favorite one.

Content
Prerequisites
Creating the CDK project
Creating CodePipeline
Adding Source stage
Adding Build stage
Adding Staging deployment stage with ECS action
Adding Manual Approval stage
AWS CodeDeploy and ECS Blue/Green deployment
Configuring Slack for CodePipeline notifications
Running the project

Prerequisites
AWS account and configure AWS CLI
Familiar with AWS CodePipeline
Installed Node.js and AWS CDK
Installed Typescript

Creating the CDK project
mkdir awscdk-codepipeline 
cd awscdk-codepipeline
cdk init app — language typescript


Creating CodePipeline
We need to create an object from the Pipeline class in “@aws-cdk/aws-codepipeline”. This is the main object which combines all the stages of the pipeline. Ref

To keep the code clear and simple, I have added few helper classes for each stage. For example, SourceStage helper class keeps the functionalities related to the Source stage.

Following is the main stack of this application.


Adding Source Stage
This is the starting point of the CodePipeline. In this example, I use the AWS CodeCommit as the repository with a simple dockerized SpringBoot application.



As shown in the above class , getCodeCommitSourceAction function returns a CodeCommitSourceAction. The next stage of the CodePipeline uses the output artifacts from this stage.

CodeCommitSourceAction properties

actionName: Name of the action 
repository: CodeCommit repository object
output: This is the output artifacts from “Source” stage to “Build” stage.

Adding Build Stage
In the Build stage, we need to set up a CodeBuild project that compiles the source code, runs unit tests, and produces artifacts that are ready to deploy. AWS CodeBuild uses a buildspec that has all the commands and settings for running the build. You can include a “buildspec” as part of the source code or you can define a “buildspec” when you create the CodeBuild project.

In this example, the CodeBuild project produces a Docker image and pushes it to AWS Elastic Container Repository (ECR). Following helper class creates the CodeBuildProject and returns a ‘CodeBuildAction”.


PiplelineProject properties

projectName: Name of the build project
environment: Build environment to use for the build.
environmentVariables: Additional environment variables to add to the build environment.
buildSpec: Filename or contents of buildspec in JSON format.
cache: Caching strategy to use.
CodeBuildAction properties

actionName: Name of the build action.
input: The source to use as input for this action.
project: CodeBuild project.
outputs: The list of output Artifacts for this action.


Adding Build stage to the CodePipeline


Adding Staging Deployment Stage with ECS Action
The purpose of the staging environment is to test the newly developed features/changes of our application. So we can verify the application before deploying it to the production environment. In this example, I deploy the docker image that we created in the previous stage to ECS.

Since my application is running in ECS, we need to create an EcsDeployAction and bind it to the CodePipeline. In this example, I have set up an ECS Fargate service for deploying the application, and details are as follows. Ref


