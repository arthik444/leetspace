import { demoProblems } from "./demoData";

const copy = (obj) => JSON.parse(JSON.stringify(obj));

export const demoApi = {
	getProblems: async ({ sort_by = "date_solved", order = "desc" } = {}) => {
		const sorted = [...demoProblems].sort((a, b) => {
			if (sort_by === "date_solved") {
				return order === "desc"
					? (a.date_solved < b.date_solved ? 1 : -1)
					: (a.date_solved > b.date_solved ? 1 : -1);
			}
			return 0;
		});
		return { data: { count: sorted.length, problems: copy(sorted) } };
	},

	getProblem: async (id) => {
		const found = demoProblems.find((p) => p.id === id);
		if (!found) throw new Error("Not found");
		return { data: copy(found) };
	},

	getDashboard: async () => {
		const problems = demoProblems;
		
		// Enhanced basic stats with educational context
		const total_problems = problems.length;
		const retry_count = problems.filter((p) => p.retry_later === "Yes").length;
		const uniqueDates = new Set(problems.map((p) => p.date_solved));
		const total_active_days = uniqueDates.size;
		
		// Difficulty breakdown based on feature importance
		const diffCounts = { easy: 0, medium: 0, hard: 0 };
		for (const p of problems) {
			if (p.difficulty === "Easy") diffCounts.easy += 1;
			if (p.difficulty === "Medium") diffCounts.medium += 1;
			if (p.difficulty === "Hard") diffCounts.hard += 1;
		}
		
		// Educational tags that show learning focus
		const tags = {};
		for (const p of problems) {
			for (const t of p.tags || []) tags[t] = (tags[t] || 0) + 1;
		}
		const most_used_tags = Object.entries(tags)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([tag, count]) => ({ tag, count }));
		
		// Weakness detection based on retry rate
		const tagStats = {};
		for (const p of problems) {
			for (const tag of p.tags || []) {
				if (!tagStats[tag]) tagStats[tag] = { total: 0, retry_count: 0 };
				tagStats[tag].total += 1;
				if (p.retry_later === "Yes") tagStats[tag].retry_count += 1;
			}
		}
		
		const weaknesses = Object.entries(tagStats)
			.filter(([tag, stats]) => stats.total >= 3 && stats.retry_count / stats.total > 0.3)
			.map(([tag, stats]) => ({
				tag,
				retry_rate: Math.round((stats.retry_count / stats.total) * 100),
				total_problems: stats.total,
				retry_count: stats.retry_count,
			}))
			.sort((a, b) => b.retry_rate - a.retry_rate);

		// Today's revision using new queue-based system
		let todays_revision = null;
		const today = new Date();
		
		// Build dynamic queue from problems with retry_later = "Yes"
		const retry_queue = [];
		for (const problem of problems) {
			if (problem.retry_later === "Yes") {
				const [y, m, d] = problem.date_solved.split("-").map(Number);
				const solved_date = new Date(y, m - 1, d);
				const days_since = Math.floor((today - solved_date) / (1000 * 60 * 60 * 24));
				
				// Calculate priority score based on days since solved and difficulty
				const difficulty_bonus = {"Easy": 1, "Medium": 2, "Hard": 3};
				const priority_score = days_since * (difficulty_bonus[problem.difficulty] || 1);
				
				retry_queue.push({
					problem: problem,
					priority_score: priority_score,
					days_since: days_since
				});
			}
		}
		
		if (retry_queue.length > 0) {
			// Sort by priority score (highest first)
			retry_queue.sort((a, b) => b.priority_score - a.priority_score);
			const best_suggestion = retry_queue[0];
			
			todays_revision = {
				id: best_suggestion.problem.id,
				title: best_suggestion.problem.title,
				difficulty: best_suggestion.problem.difficulty,
				tags: best_suggestion.problem.tags || [],
				days_since_solved: best_suggestion.days_since,
				review_count: best_suggestion.problem.review_count || 0,
				retry_later: best_suggestion.problem.retry_later
			};
		}

		// Activity heatmap (simplified for demo)
		const activity_heatmap = [];
		const start = new Date();
		start.setDate(start.getDate() - 365);
		
		for (let i = 0; i < 365; i++) {
			const date = new Date(start);
			date.setDate(start.getDate() + i);
			const dateStr = date.toISOString().split('T')[0];
			const count = problems.filter(p => p.date_solved === dateStr).length;
			activity_heatmap.push({
				date: dateStr,
				count: count,
				level: Math.min(count, 4)
			});
		}

		// Recent activity
		const sorted_problems = [...problems].sort((a, b) => b.date_solved.localeCompare(a.date_solved));
		const recent_activity = sorted_problems.slice(0, 5).map(p => {
			const solved = new Date(p.date_solved + 'T00:00:00');
			const days_ago = Math.floor((today - solved) / (1000 * 60 * 60 * 24));
			let time_ago;
			if (days_ago === 0) time_ago = "Today";
			else if (days_ago === 1) time_ago = "1 day ago";
			else time_ago = `${days_ago} days ago`;
			
			return {
				id: p.id,
				title: p.title,
				difficulty: p.difficulty,
				tags: (p.tags || []).slice(0, 3),
				time_ago: time_ago,
				retry_later: p.retry_later === "Yes"
			};
		});

		return {
			data: {
				basic_stats: {
					total_problems,
					retry_count,
					total_active_days,
					difficulty_breakdown: diffCounts,
					most_used_tags,
				},
				weaknesses,
				todays_revision,
				activity_heatmap,
				recent_activity,
			},
		};
	},
};