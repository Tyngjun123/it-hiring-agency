# StackTalentx — QA 测试流程（详细 CTA 用例表）

> 环境：`https://www.stacktalentx.com`（正式域名）。每条用例请在 **桌面 Chrome + 手机 Safari/Chrome** 各走一遍。
> 结果栏填 ✅Pass / ❌Fail（附 Bug 编号）。严重度：P0 阻断 / P1 严重 / P2 一般 / P3 轻微。

---

## 1. 认证 / 账号（AUTH）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| AUTH-01 | 首页/登录弹窗 | 点 **Continue with Google** | 未登录 | 跳到 Google 授权 → 返回后已登录，头像/菜单出现 | 回调不匹配 → Google 报 `redirect_uri_mismatch`；应无此错 | P0 | |
| AUTH-02 | 注册弹窗 | 填资料点 **Sign up** | 邮箱未注册 | 创建账号，跳 `/?auth=login&registered=1`，提示去登录 | 字段不全→“Invalid input…”；已注册→“An account with this email already exists.”（红字内联） | P0 | |
| AUTH-03 | 登录弹窗 | 填邮箱密码点 **Sign in** | 已有账号 | 登录成功，进首页/dashboard | 密码错→“Invalid email or password.”（内联，不清空邮箱） | P0 | |
| AUTH-04 | 忘记密码页 | 输入邮箱点 **Send code** | — | 发送验证码邮件，提示查收 | 空邮箱→“Please enter your email.” | P1 | |
| AUTH-05 | 重置密码页 | 填码+新密码点 **Reset** | 有验证码 | 密码更新，跳登录 | 字段空/密码<8位/两次不一致/码错或过期 → 对应红字提示 | P1 | |
| AUTH-06 | 任意受限页 | 直接访问 `/dashboard`、`/company`、`/admin` | 未登录 | 重定向到登录 | 不应能看到受限内容 | P0 | |
| AUTH-07 | 导航菜单 | 点 **Log out** | 已登录 | 登出，回到未登录态 | — | P2 | |

---

## 2. 职位 - 求职端（JOB）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| JOB-01 | 首页 | 职位列表加载 / 分页 | — | 显示职位卡片，Boost/Hot 标记正确 | 无职位→友好空状态，非白屏 | P1 | |
| JOB-02 | 首页 | **搜索**（关键词/地点/技能） | — | 列表按条件过滤，URL 带参数 | 无结果→“没有匹配”提示 | P1 | |
| JOB-03 | 职位详情 | 点 **Apply** | 已登录求职者 | 创建申请，按钮变 “Applied”，企业收到通知+邮件 | 未登录→跳 `/login`；非求职者→“Only job seekers can apply.”；已申请→显示 already applied；职位关闭→“no longer accepting applications.” | P0 | |
| JOB-04 | 职位卡/详情 | 点 **收藏 ♥ (Save)** | 已登录求职者 | 心形填充，加入已保存 | 未登录→“Please sign in to save jobs.”；非求职者→“Only job seekers can save jobs.” | P2 | |
| JOB-05 | Dashboard | 点 **Withdraw** 撤回申请 | 有进行中申请 | 申请撤回，列表更新 | 状态不允许→“This application can no longer be withdrawn.” | P2 | |
| JOB-06 | 职位详情 | 点 **公司名/Company** | — | 跳到公司主页 | 公司不存在→404 页 | P2 | |
| JOB-07 | 公司主页 | 提交 **Review** 评价 | 已登录求职者 | 评价提交并显示 | 非求职者/无效/已评过 → 各自提示（not-eligible / invalid / already-reviewed） | P2 | |

---

## 3. 企业端（CO）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| CO-01 | 公司设置 | 填资料点 **Save** | 企业账号 | 保存，跳 `/company/jobs?toast=company_saved`，绿条提示 | 缺姓名/WhatsApp→“Full name and WhatsApp number are required.”；缺公司名/邮箱→“Company name and contact email are required.” | P0 | |
| CO-02 | 发布职位 | 填表点 **Post job** | 已设公司资料 | 创建职位，跳 `/company/jobs?toast=job_posted` | 未设资料→跳 `/company/setup`；超套餐上限→红条 `free_limit`/`pro_limit` | P0 | |
| CO-03 | 编辑职位 | 点 **Save changes** | 拥有该职位 | 更新，跳 `?toast=job_updated` | 非本公司职位→无权/拦截 | P1 | |
| CO-04 | 职位列表 | **暂停/关闭/重新上架** | 拥有该职位 | 状态变更，对应 toast | 重新上架超上限→红条 limit 提示 | P1 | |
| CO-05 | 职位列表 | 点 **Duplicate** 复制职位 | — | 生成副本，`?toast=job_duplicated` | — | P2 | |
| CO-06 | 申请者页 | 改 **申请状态**（下拉） | 有申请者 | 状态更新，申请者收到通知 | — | P1 | |
| CO-07 | 职位 Boost 页 | 点 **Request boost** | — | 提交请求，`?requested=1` 提示汇款 | 未设资料→跳 setup | P2 | |
| CO-08 | Billing 页 | 点 **Upgrade to Pro/Max** | — | 提交升级请求，`/company/billing?requested=1` | 已是该套餐/套餐未开放→跳 billing 不报错 | P1 | |
| CO-09 | 各处 | 免费账号发第 N+1 个职位 | 达免费上限 | 被拦，提示升级 | 红条 `free_limit`，不创建 | P1 | |

---

## 4. 求职者引导 & 资料（ONB / PRO）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| ONB-01 | Onboarding 角色 | 选 **求职者 / 企业** | 新登录用户 | 记录角色，进入下一步 | 未登录→“Not authenticated” | P1 | |
| ONB-02 | Onboarding 简历 | 上传 **Resume** | 求职者 | 文件上传成功，保存 URL | 上传失败→“Could not start upload. Please try again.” | P1 | |
| ONB-03 | Onboarding 技能 | 加技能点 **Continue** | 求职者 | 保存技能列表 | 未认证→提示 | P2 | |
| ONB-04 | Onboarding 偏好 | 选类型点 **Finish** | 求职者 | 保存偏好，进 dashboard | — | P2 | |
| PRO-01 | Profile | 编辑资料点 **Save** | 求职者 | 保存，`/profile?toast=profile_saved` | — | P1 | |
| PRO-02 | Profile | **加/删技能**、**删简历** | — | 即时更新，列表刷新 | — | P2 | |
| PRO-03 | Profile/详情 | 点 **查看简历** | 有简历 | 打开签名 URL 预览 | 无简历→“No résumé”；加载失败→“Could not load résumé.” | P2 | |

---

## 5. 通知 & 联系（NOTI / CONT）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| NOTI-01 | 通知铃铛 | 点单条通知 **标记已读** | 有通知 | 该条变已读，未读数-1 | — | P2 | |
| NOTI-02 | 通知页 | 点 **全部已读** | 有未读 | 全部变已读，红点消失 | — | P3 | |
| CONT-01 | Contact 页 | 填表点 **Send message** | — | 跳 `/contact?sent=1`，`support@` 收到邮件 | 缺姓名/邮箱/内容→跳 `/contact?error=1` 红条 | P1 | |

---

## 6. 管理后台（ADM）

| ID | 页面/位置 | CTA / 操作 | 前置条件 | 点击后预期效果（成功） | 出错时预期表现 | 严重度 | 结果 |
|----|-----------|-----------|----------|------------------------|----------------|--------|------|
| ADM-01 | 任意 admin 页 | 非管理员访问 | 普通用户 | 重定向到首页 `/` | 不应看到后台 | P0 | |
| ADM-02 | Admin 首页 | 点 **Approve/Reject payment** | 有待审付款 | 状态更新，`?toast=payment_approved/rejected`，企业套餐生效 | — | P0 | |
| ADM-03 | Companies | 改套餐点 **Save** | — | `/admin/companies?toast=plan_saved` | 无效输入→`?error=1` | P1 | |
| ADM-04 | Settings | **Send test email**（新功能） | 管理员 | 收到测试邮件，`?testemail=sent`，绿条 | 邮箱格式错→`invalid`；发送失败→`error`（提示查 RESEND_API_KEY/域名） | P1 | |
| ADM-05 | Settings | 切 **维护模式 ON/OFF** | — | 全站进入/退出维护页，对应红/绿条 | — | P1 | |
| ADM-06 | Settings | 切 **Max/Pro 套餐 上架** | — | 定价/billing 页显示或隐藏升级按钮 | — | P2 | |
| ADM-07 | Settings | 存 Logo/社媒/联系 点 **Save** | — | `?toast=settings_saved` | — | P2 | |
| ADM-08 | Blog | **新建/编辑/删除**、切 published | — | 对应 toast，前台 `/blog` 同步更新 | 缺 slug/标题→`?error=1` | P1 | |
| ADM-09 | Emails | 存邮件模板 点 **Save** | — | `?toast=email_saved` | 缺 key/主题/正文→`?error=1` | P2 | |

---

## 7. UI 视觉检查（每页通用，UI）

| ID | 检查项 | 预期 | 出错表现 | 结果 |
|----|--------|------|----------|------|
| UI-01 | 响应式 375/768/1280px | 不破版、不横向滚动 | 元素重叠/溢出 | |
| UI-02 | 品牌一致性 | 主色 #F97316、字体、圆角统一 | 颜色/字体不一致 | |
| UI-03 | 按钮状态 | hover/点击/禁用 有视觉反馈 | 无反馈、禁用仍可点 | |
| UI-04 | 输入框状态 | focus 高亮、报错红框 | 无提示 | |
| UI-05 | 空状态 | 列表为空有占位文案 | 白屏/空白 | |
| UI-06 | 加载状态 | 提交/加载有 loading | 卡死无反馈 | |
| UI-07 | 图片 | logo/封面/头像 缺图有占位、不变形 | 拉伸/裂图 | |
| UI-08 | 长文本 | 超长标题/公司名 截断或换行 | 溢出破版 | |
| UI-09 | 浏览器缩放 125%/150% | 不错位 | 布局崩 | |

---

## 8. UX 体验检查（UX）

| ID | 检查项 | 预期 | 出错表现 | 结果 |
|----|--------|------|----------|------|
| UX-01 | 操作反馈 | 每个 CTA 有成功/失败提示（toast/内联） | 点了没反应，用户不知成没成 | |
| UX-02 | 错误信息 | 明确说明哪里错、怎么改 | 只有“出错了”无细节 | |
| UX-03 | 表单不丢数据 | 校验失败保留已填内容 | 报错后清空重填 | |
| UX-04 | 防误操作 | 删除/关闭有二次确认 | 一点即删无提示 | |
| UX-05 | 手机键盘 | email/tel 字段唤起对应键盘 | 全是默认键盘 | |
| UX-06 | 导航 | 返回/面包屑/当前页高亮 到位 | 迷路、无返回 | |
| UX-07 | 404/Error 页 | 有回首页入口、友好文案 | 空白/报栈 | |
| UX-08 | 可访问性 | 图片 alt、表单 label、键盘可操作、对比度够 | Tab 走不通、对比过低 | |
| UX-09 | 文案 | 无错别字、无 lorem 假文、中英统一 | 占位文/错字 | |
| UX-10 | 首屏速度 | 主要页 <3s 可交互（Lighthouse） | 明显卡顿 | |

---

## 9. 上线前基建专项（INF）

| ID | 检查项 | 预期 | 结果 |
|----|--------|------|------|
| INF-01 | HTTPS + 证书 | `https://www.` 正常无警告 | |
| INF-02 | 裸域名跳转 | `stacktalentx.com` → `www` (308) | |
| INF-03 | Google 登录回调 | 新域名可登录 | |
| INF-04 | sitemap/robots | 指向新域名，Search Console Success | |
| INF-05 | 邮件送达 | 从 `noreply@` 发，不进垃圾箱，SPF/DKIM 通过 | |
| INF-06 | `support@` 收信 | 能正常收到（含表单/回复） | |
| INF-07 | 无旧域名残留 | 页面/邮件链接均为新域名 | |

---

## Bug 记录模板

```
[Bug-XX] 标题
- 用例ID：JOB-03
- 设备/浏览器：iPhone 15 / Safari
- 复现步骤：1... 2... 3...
- 预期：按钮变 Applied
- 实际：报 500，白屏
- 严重度：P0
- 截图：...
```

## 签核标准
✅ 所有 **P0 / P1 清零** 方可上线；P2/P3 记入 backlog。
