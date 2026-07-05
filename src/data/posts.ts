export type Post = {
  slug: string
  title: string
  date: string       // YYYY-MM-DD
  summary: string
  content: string    // HTML — use <p>, <h2>, <ul>, <strong>, <a> tags
  category?: string
  author?: string
  authorInitials?: string
  readTime?: string
  cover?: string     // CSS gradient for cover placeholder
  featured?: boolean
}

export const BLOG_CATEGORIES = ["All", "Salary Guide", "Interview Prep", "Hiring Tips", "Career"]

export const posts: Post[] = [
  {
    slug: "2026-malaysia-tech-salary-report",
    title: "The 2026 Malaysia tech salary report: what developers really earn",
    date: "2026-06-12",
    category: "Salary Guide",
    author: "Farah Hanim",
    authorInitials: "FH",
    readTime: "8 min read",
    cover: "repeating-linear-gradient(135deg, #FFF1E1, #FFF1E1 13px, #FFE8CF 13px, #FFE8CF 26px)",
    featured: true,
    summary: "We surveyed 3,400 engineers across KL, Penang and Cyberjaya to map real salary bands by role, stack and seniority.",
    content: `
      <p>Salaries for Malaysian software engineers climbed again this year, but the gap between roles, stacks and cities is wider than ever. We surveyed 3,400 engineers to find out what's really being paid in 2026.</p>

      <h2>Salaries by seniority</h2>
      <p>Mid-level engineers in Kuala Lumpur saw the steepest growth, driven by demand from fintech and e-commerce companies competing for the same shrinking talent pool.</p>
      <blockquote>"Senior backend engineers with cloud experience now command RM 14,000–18,000 a month in KL — a 15% jump from 2024."</blockquote>

      <h2>Which stacks pay the most</h2>
      <p>Go, Rust and cloud-native skills carry the biggest premium, while strong demand continues for React and TypeScript across product teams.</p>
      <ul>
        <li>Cloud &amp; DevOps roles pay 18% above the market median</li>
        <li>Remote-first companies pay roughly on par with KL on-site roles</li>
        <li>Penang's hardware-adjacent software roles are closing the gap with KL</li>
      </ul>
      <p>Use these benchmarks as a starting point — and when you're ready, browse roles that match your range on StackTalentx.</p>
    `,
  },
  {
    slug: "negotiate-tech-salary-malaysia",
    title: "How to negotiate your tech salary in Malaysia (and actually win)",
    date: "2026-06-05",
    category: "Salary Guide",
    author: "Wei Liang",
    authorInitials: "WL",
    readTime: "6 min read",
    cover: "repeating-linear-gradient(135deg, #E0F2FE, #E0F2FE 13px, #BAE6FD 13px, #BAE6FD 26px)",
    summary: "Most engineers leave money on the table. Here's a step-by-step playbook for negotiating a better offer at a Malaysian tech company.",
    content: `
      <p>Most engineers accept the first number they're offered. In a market where Malaysian tech salaries are rising fast, that means leaving significant money on the table.</p>

      <h2>Know your market rate first</h2>
      <p>Before you walk into any negotiation, you need to know what the market is paying for your role, stack, and seniority level in your city. Use StackTalentx's salary data, ask peers, and check offer letters from competing companies.</p>
      <blockquote>"The candidate who knows their market rate negotiates from strength. The one who doesn't negotiates from hope."</blockquote>

      <h2>How to ask for more</h2>
      <p>When you receive an offer, take 24 hours before responding. Then come back with a specific counter: <em>"Based on my research and experience, I was expecting something in the RM X–Y range. Is there flexibility there?"</em></p>
      <ul>
        <li>Always negotiate in writing so there's a clear record</li>
        <li>Never reveal your current salary unless legally required</li>
        <li>Counter with a range, not a single number — anchor the top</li>
      </ul>
    `,
  },
  {
    slug: "react-interview-questions-malaysia",
    title: "Top 10 React interview questions asked at Malaysian startups",
    date: "2026-06-01",
    category: "Interview Prep",
    author: "Aditya Krishnan",
    authorInitials: "AK",
    readTime: "9 min read",
    cover: "repeating-linear-gradient(135deg, #F0FDF4, #F0FDF4 13px, #DCFCE7 13px, #DCFCE7 26px)",
    summary: "Real questions from real interviews at Grab, BigPay, Setel and others — with the answers that got candidates hired.",
    content: `
      <p>We collected interview questions from 80+ engineers who recently went through the hiring process at top Malaysian tech companies. These are the questions that came up most often.</p>

      <h2>Questions on React fundamentals</h2>
      <p>Most Malaysian companies start with core React concepts before moving to system design or take-home projects.</p>
      <ul>
        <li>Explain the difference between useEffect and useLayoutEffect</li>
        <li>How does React's reconciliation algorithm work?</li>
        <li>When would you use useReducer over useState?</li>
        <li>What is the Context API and when should you avoid it?</li>
      </ul>

      <h2>Performance and architecture questions</h2>
      <p>At senior level, expect deep questions about performance optimisation and how you'd structure a large React application.</p>
      <blockquote>"The best answers come from real experience. Tell me about a performance problem you actually solved."</blockquote>
      <p>Prepare examples from your own work — abstract answers score poorly with Malaysian engineering managers who value pragmatism.</p>
    `,
  },
  {
    slug: "devops-hiring-kl-fintech",
    title: "Why KL fintech companies are hiring more DevOps engineers",
    date: "2026-05-28",
    category: "Hiring Tips",
    author: "Sarah Tan",
    authorInitials: "ST",
    readTime: "5 min read",
    cover: "repeating-linear-gradient(135deg, #F5F3FF, #F5F3FF 13px, #EDE9FE 13px, #EDE9FE 26px)",
    summary: "Cloud-native infrastructure is now table stakes for Malaysian fintechs. Here's what's driving the demand — and how to position yourself.",
    content: `
      <p>Three years ago, a DevOps engineer was a nice-to-have at most Malaysian fintechs. In 2026, it's a hiring priority. Here's why.</p>

      <h2>BNM's cloud guidelines changed everything</h2>
      <p>Bank Negara Malaysia's updated risk management frameworks now require financial institutions to demonstrate robust cloud security posture. That means more internal DevSecOps work — and fewer outsourced setups.</p>

      <h2>What companies are actually looking for</h2>
      <p>The most in-demand skills in fintech DevOps are Kubernetes on AWS or GCP, Terraform, and experience with compliance automation.</p>
      <ul>
        <li>AWS or GCP certifications are increasingly required, not just preferred</li>
        <li>Experience in regulated industries (banking, insurance) is a significant plus</li>
        <li>Ability to work closely with security teams is now standard</li>
      </ul>
    `,
  },
  {
    slug: "junior-to-mid-level-malaysia",
    title: "From junior to mid-level: what Malaysian engineers actually need",
    date: "2026-05-22",
    category: "Career",
    author: "Mei Lin",
    authorInitials: "ML",
    readTime: "7 min read",
    cover: "repeating-linear-gradient(135deg, #FFFBEB, #FFFBEB 13px, #FEF3C7 13px, #FEF3C7 26px)",
    summary: "It's not just about years of experience. Senior engineers share what made them take their first mid-level engineers seriously.",
    content: `
      <p>The jump from junior to mid-level isn't just about time served. Across interviews with 20 engineering leads at Malaysian tech companies, one theme kept coming up: ownership.</p>

      <h2>What "ownership" actually means</h2>
      <p>It doesn't mean working longer hours or shipping features faster. Ownership means proactively identifying problems, communicating blockers early, and caring about the outcome — not just the ticket.</p>
      <blockquote>"I don't care if a junior asks for help. I care if they hide a problem until it's a crisis. That's what tells me they're not ready yet."</blockquote>

      <h2>Technical skills that matter</h2>
      <p>Mid-level engineers in Malaysia are expected to review code, mentor juniors, and design small systems end-to-end.</p>
      <ul>
        <li>Code reviews: giving and receiving feedback constructively</li>
        <li>Debugging in production environments, not just local</li>
        <li>Writing documentation that a future team member can use</li>
      </ul>
    `,
  },
  {
    slug: "remote-work-malaysian-tech",
    title: "The rise of remote work in Malaysian tech: 2026 edition",
    date: "2026-05-18",
    category: "Career",
    author: "Raj Nair",
    authorInitials: "RN",
    readTime: "4 min read",
    cover: "repeating-linear-gradient(135deg, #FFF1F2, #FFF1F2 13px, #FFE4E6 13px, #FFE4E6 26px)",
    summary: "Two years after post-pandemic return-to-office mandates, where has remote work settled in Malaysia's tech industry?",
    content: `
      <p>In 2024, the headlines were all about return-to-office. In 2026, the dust has settled — and Malaysian tech companies have landed in a more nuanced place.</p>

      <h2>Where things stand now</h2>
      <p>Our survey of 520 Malaysian tech workers found that 34% are fully remote, 48% hybrid, and just 18% fully on-site. That's a significant shift from the 2022 peak of return-to-office mandates.</p>

      <h2>Remote-friendly stacks attract top talent</h2>
      <p>Companies offering full remote consistently report shorter time-to-hire and lower offer rejection rates, particularly for senior roles.</p>
      <ul>
        <li>Penang and Johor-based engineers can now access KL salaries without relocating</li>
        <li>Remote companies pay median salaries 6% higher than on-site peers</li>
        <li>Async-first documentation culture is now a job search filter for senior engineers</li>
      </ul>
    `,
  },
  {
    slug: "backend-engineer-hiring-criteria",
    title: "What hiring managers look for in a backend engineer",
    date: "2026-05-14",
    category: "Hiring Tips",
    author: "Farah Hanim",
    authorInitials: "FH",
    readTime: "6 min read",
    cover: "repeating-linear-gradient(135deg, #ECFDF5, #ECFDF5 13px, #D1FAE5 13px, #D1FAE5 26px)",
    summary: "We spoke to 12 engineering managers at Malaysian tech companies to find out exactly what separates candidates who get offers from those who don't.",
    content: `
      <p>Backend roles are the most competitive in Malaysian tech right now. We asked 12 engineering managers what they're really evaluating — beyond the resume.</p>

      <h2>System design is table stakes</h2>
      <p>Every manager we spoke to mentioned system design as a core signal. Candidates who can talk through trade-offs — not just describe patterns — stand out.</p>
      <blockquote>"I'm not looking for the perfect design. I'm looking for someone who can reason about constraints and change their mind when I give them new information."</blockquote>

      <h2>Communication is half the job</h2>
      <p>Backend engineers at Malaysian tech companies often work closely with frontend teams and product managers. Clear written communication — especially in pull request descriptions — is increasingly valued.</p>
      <ul>
        <li>Write PR descriptions that explain the why, not just the what</li>
        <li>Proactively flag risks in technical specs before work begins</li>
        <li>Learn to translate technical constraints into product language</li>
      </ul>
    `,
  },
  {
    slug: "welcome-to-it-hire",
    title: "Welcome to StackTalentx — Malaysia's IT Job Platform",
    date: "2026-06-15",
    category: "Career",
    author: "StackTalentx Team",
    authorInitials: "ST",
    readTime: "2 min read",
    cover: "repeating-linear-gradient(135deg, #FFF7ED, #FFF7ED 13px, #FFEDD5 13px, #FFEDD5 26px)",
    summary: "We launched StackTalentx to connect Malaysia's IT talent with companies that truly need them. Here's why we built it.",
    content: `
      <p>Finding an IT job in Malaysia shouldn't feel like searching for a needle in a haystack. General job boards are flooded with non-tech listings, making it hard for IT professionals to find the right roles — and for companies to reach the right candidates.</p>

      <h2>Why StackTalentx?</h2>
      <p>StackTalentx is built exclusively for the Malaysian IT industry. Whether you're a backend developer, QA engineer, project manager, or infrastructure specialist — every job on this platform is relevant to you.</p>

      <h2>For job seekers</h2>
      <ul>
        <li>Browse IT-only listings across Malaysia</li>
        <li>Apply in seconds — no cover letters required</li>
        <li>Get notified when companies update your application status</li>
      </ul>

      <h2>For companies</h2>
      <ul>
        <li>Post up to 10 jobs for free</li>
        <li>Reach a targeted pool of IT professionals</li>
        <li>Boost your listings to appear at the top of search results</li>
      </ul>

      <p>We're just getting started. Stay tuned for more updates.</p>
    `,
  },
]
