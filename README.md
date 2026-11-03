# Reference-led UI Design

一个中文、参考驱动的 App / H5 页面与动效设计 skill，适用于 Codex，以及支持 Agent Skills 的编码助手。

先看实际页面，跨站研究案例，解释设计选择，再做可操作的草稿。学习布局、排版、颜色、材质及空间性，并主动覆盖按钮、进入、返回等完整交互。

## 一条命令安装

以下命令通过第三方开源工具 [Vercel Skills CLI](https://github.com/vercel-labs/skills)安装到 Codex。当前该 CLI 要求 Node.js 22.20 或更高版本。

个人安装，跨项目使用：

```bash
npx skills add Anchoror/reference-led-ui-design --skill reference-led-ui-design -a codex -g
```

只安装到当前项目：

```bash
npx skills add Anchoror/reference-led-ui-design --skill reference-led-ui-design -a codex
```

这是通过 npm 的 `npx` 运行现有安装器，从 GitHub 获取技能文件；不是发布同名 npm 安装包。安装会按 CLI 交互选择复制或链接方式。Codex 没有显示新技能时，重启后再检查。

手动安装时，把 `skills/reference-led-ui-design` 整个文件夹放入个人 `~/.agents/skills/` 或项目 `.agents/skills/`。详见 [OpenAI 官方技能文档](https://learn.chatgpt.com/docs/build-skills)。

## 怎么使用

在 Codex 对话中输入：

```text
请用 $reference-led-ui-design 重新设计这个页面。
先查看当前页面，跨站寻找并认真学习参考，讲清楚风格、布局、空间关系和选择理由，再做 HTML / SVG / Canvas 草稿。
```

页面转场示例：

```text
请用 $reference-led-ui-design 设计首页头像进入个人主页的过渡。
结合实际起止布局，完整观看参考动画，按动作分组解释，再做包含进入、返回和按钮反馈的可操作草稿。
```

使用时提供当前页面、可访问的预览或截图。助手需要具备浏览、播放或操作参考、制作及检查草稿的工具；安装技能本身不会提供这些能力。无法核查的动画应明确说明，不能用静态封面代替观看证据。

## 设计方法

1. 查看真实页面与入口，确认布局和任务边界。
2. 跨站研究，区分静态作品、视频分析和实际操作。
3. 读取版式与空间性：前后景、透视、体积、遮挡、光影和运动关系。
4. 建立“参考可见规则 → 草稿对应处理 → 适配理由”，明确构图、边界/圆角、密度、材质与核心动作的保留方式。
5. 制作草稿，把参考与成稿并置核对，再检查完整动作；纠正无依据的圆角、卡片等惯性模板。

以简练为基础，允许有依据的复杂设计。空间性是观察与判断维度，不要求所有页面都做成3D；也不会为视觉效果擅自添加产品能力。

## 更新与移除

更新该技能（个人安装）：

```bash
npx skills update reference-led-ui-design -g
```

移除个人安装：

```bash
npx skills remove reference-led-ui-design -a codex -g
```

项目安装的更新或移除省略 `-g`。CLI 参数以其[官方项目文档](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)为准。

## 文件

- `skills/reference-led-ui-design/SKILL.md`：工作流程与设计判断。
- `references/evidence-and-sources.md`：参考入口、证据和展示方法。
- `references/design-decisions.md`：空间轮播、体积云、跨页适配等判断示例。
- `agents/openai.yaml`：技能显示信息。

本仓库只包含通用方法、公开参考链接和技能元信息，不打包第三方案例视频、图片或产品源码。外部网站的访问权限和内容可能变化。

## 维护与发布

完善技能时，同步维护主文件、相关参考与使用说明；可公开的通用规则更新到本仓库，项目私有内容留在其所属环境。公开版不携带内部会话、产品源码或本机路径。

发布前检查技能格式、相对链接和变更范围，并先安全同步远程改动；提交、推送后核对远程版本，再向使用者说明更新内容。安装者需要运行上面的更新命令获取新版，本地安装不会因 GitHub 更新而自动刷新。

## License

MIT。该许可适用于本仓库原创文字与配置；不授予外部参考作品的复制或使用权。
