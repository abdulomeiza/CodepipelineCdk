export class AwscdkCodepipelineStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const appName = this.node.tryGetContext("appName");

        const codepipeline = new Pipeline(this, appName, {
            crossAccountKeys: false
        })

        //Source Stage
        const sourceStage = new SourceStage(this);
        codepipeline.addStage({
            stageName: "Source",
            actions: [sourceStage.getCodeCommitSourceAction()],
        });

        //Build Stage
        const buildStage = new BuildStage(this);
        codepipeline.addStage({
            stageName: "Build",
            actions: [buildStage.getCodeBuildAction(sourceStage.getSourceOutput())]
        });

        //Staging Stage
        const deployStage = new DeployStage(this);
        codepipeline.addStage({
            stageName: "Deploy-TEST",
            actions: [deployStage.getEcsDeployAction("dev", buildStage.getBuildOutput())]
        });

        //QA Approval Stage
        const approvalStage = new ApprovalStage(this);
        codepipeline.addStage({
            stageName: "Approval",
            actions: [approvalStage.getManualApprovalAction()]
        });

        //Deploy to Prod
        codepipeline.addStage({
            stageName: "Deploy-Prod",
            actions: [deployStage.getCodeDeployEcsDeployAction("prod", buildStage.getBuildOutput())]
        });

        //Configure notifications for the pipeline events
        const pipelineNotification = new PipelineNotification(this);
        pipelineNotification.configureSlackNotifications(codepipeline, PipelineConfig.notification.slack);
    }
}
