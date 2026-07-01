BOX_RULES = {
    1: {
        "label": "Underperformer - Low Potential, Low Performance",
        "strategies": [
            "Initiate a structured Performance Improvement Plan (PIP) with clear 30/60/90-day milestones",
            "Schedule bi-weekly 1-on-1 meetings with direct manager to track progress",
            "Identify root causes of underperformance through an honest career conversation",
            "Assign a peer mentor from a high-performing colleague",
            "Set SMART short-term goals to rebuild momentum and confidence",
            "Provide targeted training in core role competencies",
            "Consider role redeployment to a better-fit position within the organization",
            "Evaluate workload and stress levels — burnout may be a factor",
            "Offer access to Employee Assistance Programs (EAP) for personal support",
            "Re-assess placement after 90 days of focused intervention",
        ]
    },
    2: {
        "label": "Solid but Limited - Low Potential, Medium Performance",
        "strategies": [
            "Acknowledge consistent contributions and reward stability",
            "Clarify long-term career expectations to align ambition with reality",
            "Provide specialized technical training to deepen expertise in current role",
            "Create a subject-matter expert (SME) path as an alternative to management",
            "Encourage mentorship of junior team members to leverage experience",
            "Improve task variety to sustain engagement and avoid stagnation",
            "Set clear performance targets with quarterly reviews",
            "Recognize achievements publicly to boost morale",
            "Explore cross-functional projects to broaden perspective",
            "Retain through competitive compensation benchmarking",
        ]
    },
    3: {
        "label": "Trusted Professional - Low Potential, High Performance",
        "strategies": [
            "Implement a targeted retention strategy — high flight risk!",
            "Offer senior specialist or technical expert career track",
            "Provide competitive compensation and benefits review",
            "Recognize publicly through awards, promotions, or titles",
            "Offer flexible work arrangements as a loyalty incentive",
            "Engage in knowledge transfer programs to leverage expertise",
            "Provide stretch assignments in current domain",
            "Schedule strategic career discussions to understand aspirations",
            "Create succession planning documentation leveraging their expertise",
            "Consider team-lead role without full management responsibilities",
        ]
    },
    4: {
        "label": "Inconsistent Player - Medium Potential, Low Performance",
        "strategies": [
            "Identify specific barriers to performance — skills, motivation, or environment",
            "Create a personalized development plan aligned with their potential",
            "Increase coaching frequency with focus on skill application",
            "Assign challenging but achievable projects to reignite motivation",
            "Pair with a high-performer buddy for collaborative learning",
            "Address engagement issues through team activities or role adjustments",
            "Clarify performance expectations and success metrics clearly",
            "Provide workshops on time management and productivity",
            "Explore whether the role matches their skill strengths",
            "Set 6-month review checkpoint with development milestones",
        ]
    },
    5: {
        "label": "Core Contributor - Medium Potential, Medium Performance",
        "strategies": [
            "Design a clear career growth pathway with defined milestones",
            "Provide leadership development workshops and simulations",
            "Assign cross-departmental projects to expand organizational awareness",
            "Enroll in professional certifications relevant to career goals",
            "Introduce stretch goals to push performance to the next level",
            "Offer shadowing opportunities with senior leaders",
            "Build presentation and communication skills for higher visibility",
            "Encourage participation in innovation challenges or hackathons",
            "Schedule semi-annual talent review discussions with HR",
            "Create a 12-month development roadmap with manager alignment",
        ]
    },
    6: {
        "label": "High Performer - Medium Potential, High Performance",
        "strategies": [
            "Fast-track for promotion consideration in the next review cycle",
            "Provide senior leadership mentoring program access",
            "Assign high-impact projects with executive visibility",
            "Offer management or team-lead trial responsibilities",
            "Include in strategic planning discussions and initiatives",
            "Enroll in advanced leadership or MBA programs",
            "Provide international or cross-regional project exposure",
            "Create a succession plan identifying them as a key talent",
            "Recognize with performance-based bonuses and equity options",
            "Facilitate networking with senior stakeholders and executives",
        ]
    },
    7: {
        "label": "Emerging Talent - High Potential, Low Performance",
        "strategies": [
            "Investigate performance gaps — may be in the wrong role",
            "Provide intensive onboarding or re-onboarding support",
            "Assign a dedicated executive coach or mentor",
            "Adjust role responsibilities to better match strengths",
            "Create psychological safety for risk-taking and learning from failure",
            "Set clear short-term performance expectations with weekly check-ins",
            "Provide learning resources: online courses, books, and workshops",
            "Engage in regular feedback loops — monthly retrospectives",
            "Protect from organizational politics while they develop",
            "Plan a 6-month turnaround roadmap with measurable outcomes",
        ]
    },
    8: {
        "label": "Future Leader - High Potential, Medium Performance",
        "strategies": [
            "Enroll in a formal high-potential leadership development program",
            "Assign executive sponsorship for career acceleration",
            "Provide rotational assignments across key business functions",
            "Create board or committee membership opportunities",
            "Offer external executive education programs (Harvard, Wharton, etc.)",
            "Include in succession planning for C-suite or senior roles",
            "Challenge with enterprise-wide strategic projects",
            "Provide 360-degree feedback assessment for self-awareness",
            "Build external thought leadership through speaking or publishing",
            "Design a 2-year accelerated career development roadmap",
        ]
    },
    9: {
        "label": "Star Performer - High Potential, High Performance",
        "strategies": [
            "Immediately include in C-suite succession planning",
            "Offer executive leadership program enrollment (internal/external)",
            "Assign ownership of a key strategic business initiative",
            "Provide equity, profit-sharing, or long-term incentive plans",
            "Create a personalized executive development curriculum",
            "Facilitate board-level exposure and investor relations participation",
            "Build external brand through speaking engagements and publications",
            "Offer international assignment or global leadership role",
            "Establish a reverse mentoring program where they coach senior leaders",
            "Design a 3-year career trajectory with CEO-track milestones",
        ]
    }
}


def build_ollama_prompt(employee_data: dict, box: int, rule_recs: list) -> str:
    label = BOX_RULES.get(box, {}).get("label", f"Box {box}")
    return f"""You are an expert HR consultant and executive coach. An employee has been assessed in the 9-Box Grid framework.

Employee Profile:
- Name: {employee_data.get('employee_name', 'N/A')}
- Department: {employee_data.get('department', 'N/A')}
- Role: {employee_data.get('job_role', 'N/A')}
- Age: {employee_data.get('age', 'N/A')}
- Experience: {employee_data.get('years_of_experience', 'N/A')} years
- KPI Score: {employee_data.get('kpi_score', 'N/A')}
- Performance Level: {employee_data.get('performance_level', 'N/A')}
- Potential Level: {employee_data.get('potential_level', 'N/A')}
- 9-Box Position: Box {box} ({label})
- Skill Score: {employee_data.get('skill_assessment_score', 'N/A')}
- Leadership Score: {employee_data.get('leadership_assessment_score', 'N/A')}
- Training Hours: {employee_data.get('training_hours', 'N/A')}

Based on this profile, provide exactly 3 additional highly personalized, actionable development recommendations that complement these existing suggestions:
{chr(10).join(f"- {r}" for r in rule_recs[:3])}

Format your response as a numbered list (1. 2. 3.) with concise, specific, actionable recommendations tailored to their role and department. Be direct and practical."""
