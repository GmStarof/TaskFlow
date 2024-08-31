using Volo.Abp.Settings;

namespace TaskFlow.Settings;

public class TaskFlowSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(TaskFlowSettings.MySetting1));
    }
}
