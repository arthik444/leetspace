export const demoProblems = [
	{
		id: "demo1",
		user_id: "abc123",
		title: "Welcome to myLeetSpace",
		url: "/oops",
		difficulty: "Easy",
		tags: ["tutorial", "getting-started"],
		date_solved: "2025-02-15",
		notes: `# Welcome to myLeetSpace

**What is myLeetSpace?**
A private coding practice journal that helps you track, learn, and improve systematically.

**Key Benefits:**
- **Version Control**: Track multiple solution attempts
- **Mistake Learning**: Identify patterns in your errors
- **Smart Review**: Spaced repetition for better retention
- **Progress Insights**: Understand your learning journey

**Getting Started:**
1. Log your first problem
2. Add detailed notes
3. Mark problems for review
4. Track your progress over time

This is your personal coding journal - make it work for you!`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nmyLeetSpace transforms random practice into systematic learning. Start by logging problems with detailed notes and use the review system to reinforce concepts." }
		],
		retry_later: "No",
		review_count: 0,
	},
	{
		id: "demo2",
		user_id: "abc123",
		title: "Why Track Your Practice?",
		url: "/oops",
		difficulty: "Easy",
		tags: ["tutorial", "learning-strategy"],
		date_solved: "2025-02-14",
		notes: `# Why Track Your Practice?

**The Problem with Random Practice:**
- You solve problems but forget solutions
- No systematic review of concepts
- Hard to identify weak areas
- Inconsistent improvement

**How myLeetSpace Helps:**
- **Memory**: Spaced repetition reinforces learning
- **Patterns**: Spot recurring mistakes and concepts
- **Focus**: Identify areas needing more practice
- **Progress**: See your improvement over time

**Real Example:**
After tracking 50 problems, you'll see which concepts you struggle with most and can focus your study time effectively.`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nTracking practice transforms random coding into systematic learning. The data reveals patterns you can't see otherwise." }
		],
		retry_later: "No",
		review_count: 0,
	},
	{
		id: "demo3",
		user_id: "abc123",
		title: "Writing Effective Notes",
		url: "/oops",
		difficulty: "Medium",
		tags: ["tutorial", "best-practice"],
		date_solved: "2025-02-13",
		notes: `# Writing Effective Notes

**What to Include:**
- **Problem Understanding**: What the problem is asking
- **Approach**: Your thought process and strategy
- **Key Insights**: Important concepts or patterns
- **Common Mistakes**: What to avoid next time
- **Related Problems**: Similar problems you've seen

**Note Structure:**
1. **Summary**: 1-2 sentence problem description
2. **Approach**: Your solution strategy
3. **Key Concepts**: Important algorithms/patterns
4. **Gotchas**: Common pitfalls
5. **Variations**: How this problem could change

**Pro Tip**: Write notes as if explaining to your future self!`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nGood notes are your future self's best friend. Include context, approach, and insights that will help you months later." }
		],
		retry_later: "Yes",
		review_count: 2,
	},
	{
		id: "demo4",
		user_id: "abc123",
		title: "Using Tags Effectively",
		url: "/oops",
		difficulty: "Medium",
		tags: ["tutorial", "organization"],
		date_solved: "2025-02-12",
		notes: `# Using Tags Effectively

**Tag Categories:**
- **Data Structures**: Array, Tree, Graph, Heap
- **Algorithms**: DFS, BFS, DP, Greedy
- **Concepts**: Two Pointers, Sliding Window
- **Difficulty**: Easy, Medium, Hard
- **Status**: Need Review, Mastered, Struggling

**Tagging Strategy:**
1. **Be Consistent**: Use the same tags for similar problems
2. **Be Specific**: "Binary Search" not just "Search"
3. **Combine Tags**: "Tree + DFS + Recursion"
4. **Review Tags**: Periodically clean up unused tags

**Benefits:**
- Find related problems quickly
- Identify weak areas by tag
- Build focused study sessions
- Track progress by concept`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nGood tagging creates a searchable knowledge base. Be consistent and specific to maximize the value." }
		],
		retry_later: "No",
		review_count: 0,
	},
	{
		id: "demo5",
		user_id: "abc123",
		title: "The Review System",
		url: "/oops",
		difficulty: "Hard",
		tags: ["tutorial", "spaced-repetition"],
		date_solved: "2025-02-11",
		notes: `# The Review System

**How It Works:**
- Problems marked "Retry Later" enter the review queue
- Review priority based on:
  - Time since last attempt
  - Problem difficulty
  - Your success rate
  - Concept importance

**Review Schedule:**
- **Easy Problems**: Review every 7-14 days
- **Medium Problems**: Review every 3-7 days  
- **Hard Problems**: Review every 1-3 days
- **Failed Attempts**: Review within 24 hours

**Review Process:**
1. Try to solve without looking at notes
2. Compare with your previous solution
3. Update notes with new insights
4. Mark as "Mastered" or "Need More Practice"

**Pro Tip**: Don't skip reviews - they're where real learning happens!`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nThe review system uses spaced repetition to move concepts from short-term to long-term memory." }
		],
		retry_later: "Yes",
		review_count: 1,
	},
	{
		id: "demo6",
		user_id: "abc123",
		title: "Tracking Multiple Solutions",
		url: "/oops",
		difficulty: "Hard",
		tags: ["tutorial", "version-control"],
		date_solved: "2025-02-10",
		notes: `# Tracking Multiple Solutions

**Why Multiple Solutions?**
- **Learning**: Different approaches teach different concepts
- **Comparison**: See trade-offs between solutions
- **Improvement**: Track your growth over time
- **Interview Prep**: Have multiple approaches ready

**Solution Types:**
1. **Brute Force**: Simple but inefficient
2. **Optimized**: Better time/space complexity
3. **Alternative**: Different algorithm approach
4. **Language Specific**: Leverage language features

**How to Log:**
- Add new solution to existing problem
- Note what you learned from each attempt
- Compare time/space complexity
- Mark which approach you prefer

**Example**: Two Sum can be solved with nested loops (O(n²)) or hashmap (O(n))`,
		solutions: [
			{ language: "python", code: "# Brute Force Approach - O(n²)\ndef twoSum_brute(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []" },
			{ language: "python", code: "# Hashmap Approach - O(n)\ndef twoSum_hashmap(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []" },
			{ language: "javascript", code: "// Two Pointers with Sorted Array - O(n log n)\nfunction twoSum_twoPointers(nums, target) {\n    const sorted = nums.map((num, index) => ({num, index}))\n        .sort((a, b) => a.num - b.num);\n    \n    let left = 0, right = sorted.length - 1;\n    while (left < right) {\n        const sum = sorted[left].num + sorted[right].num;\n        if (sum === target) {\n            return [sorted[left].index, sorted[right].index];\n        } else if (sum < target) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n    return [];\n}" },
			{ language: "markdown", code: "## Key Takeaway\n\nMultiple solutions show your growth and give you options. Each attempt teaches something new about algorithms and trade-offs." }
		],
		retry_later: "No",
		review_count: 0,
	},
	{
		id: "demo7",
		user_id: "abc123",
		title: "Learning from Mistakes",
		url: "/oops",
		difficulty: "Medium",
		tags: ["tutorial", "error-analysis"],
		date_solved: "2025-02-09",
		notes: `# Learning from Mistakes

**Common Mistake Categories:**
- **Edge Cases**: Forgetting empty arrays, null values
- **Off-by-One**: Array indexing errors
- **Algorithm Choice**: Wrong approach for the problem
- **Implementation**: Syntax or logic errors
- **Time Complexity**: Inefficient solutions

**Mistake Tracking:**
1. **Log the Error**: What went wrong specifically
2. **Identify Pattern**: Is this a recurring issue?
3. **Root Cause**: Why did this happen?
4. **Prevention**: How to avoid next time?

**Mistake Patterns to Watch:**
- **Consistent**: Same error across multiple problems
- **Conceptual**: Fundamental misunderstanding
- **Careless**: Simple oversights
- **Complexity**: Overthinking simple problems

**Pro Tip**: Mistakes are learning opportunities - track them systematically!`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nMistakes reveal your learning gaps. Track them systematically to turn weaknesses into strengths." }
		],
		retry_later: "Yes",
		review_count: 0,
	},
	{
		id: "demo8",
		user_id: "abc123",
		title: "Building Study Plans",
		url: "/oops",
		difficulty: "Easy",
		tags: ["tutorial", "planning"],
		date_solved: "2025-02-08",
		notes: `# Building Study Plans

**Plan Components:**
1. **Assessment**: Identify your current level
2. **Goals**: What you want to achieve
3. **Weak Areas**: Concepts needing focus
4. **Schedule**: Daily/weekly practice routine
5. **Review**: Regular progress evaluation

**Weekly Structure:**
- **Monday**: New concepts (2-3 problems)
- **Tuesday**: Practice weak areas
- **Wednesday**: Review old problems
- **Thursday**: Challenge problems
- **Friday**: Mixed review
- **Weekend**: Focus on struggling concepts

**Topic Progression:**
- Start with fundamentals (Arrays, Strings)
- Move to intermediate (Trees, Graphs)
- Advanced concepts (DP, Advanced Algos)
- Mixed practice and review

**Pro Tip**: Adapt your plan based on what the data shows you need!`,
		solutions: [
			{ language: "markdown", code: "## Key Takeaway\n\nA good study plan combines new learning with systematic review. Let your progress data guide your focus areas." }
		],
		retry_later: "No",
		review_count: 0,
	},
];