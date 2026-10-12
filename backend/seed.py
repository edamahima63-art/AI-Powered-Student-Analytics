"""
Demo data seeder — idempotent (safe to run multiple times).
"""
from sqlalchemy.orm import Session
from database import (
    User, StudentProfile, SubjectResult, GpaRecord,
    AttendanceRecord, Recommendation, RiskAssessment, StudyTask, Notification,
    Assessment, AssessmentSubmission, Quiz, QuizQuestion, QuizAttempt
)
from auth_utils import hash_password
import uuid, json
from datetime import datetime, timedelta


def _uid():
    return f"USR-{uuid.uuid4().hex[:8].upper()}"


def seed_demo_data(db: Session):
    """Seed demo accounts only if they don't already exist."""

    # ─── Student A: Ananya Patel ───────────────────────────────────────────
    if not db.query(User).filter(User.email == "studenta@eduinsight.com").first():
        user_a = User(
            uid=_uid(),
            email="studenta@eduinsight.com",
            hashed_pw=hash_password("StudentA@123"),
            name="Ananya Patel",
            role="student",
            department="Computer Science",
        )
        db.add(user_a)
        db.flush()

        profile_a = StudentProfile(user_id=user_a.id, student_code="STU-2024-0042", semester=4)
        db.add(profile_a)
        db.flush()

        # Subject results for Student A (strong performer)
        subjects_a = [
            ("Mathematics III",    "MA301", 85, 100, "A",  4, 3, "Prof. K. Iyer",   85),
            ("Data Structures",    "CS301", 82, 100, "A",  4, 4, "Prof. R. Kumar",  80),
            ("Algorithms",         "CS302", 78, 100, "A",  4, 4, "Prof. S. Menon",  80),
            ("Database Systems",   "CS303", 90, 100, "A+", 4, 3, "Prof. A. Desai",  85),
            ("Operating Systems",  "CS304", 76, 100, "A",  4, 4, "Prof. V. Nair",   75),
            ("Computer Networks",  "CS305", 88, 100, "A+", 4, 3, "Prof. M. Singh",  80),
        ]
        for subj, code, marks, mx, grade, sem, credits, teacher, target in subjects_a:
            db.add(SubjectResult(
                student_id=profile_a.id, subject=subj, code=code,
                marks=marks, max_marks=mx, grade=grade, semester=sem,
                credits=credits, teacher=teacher, target=target
            ))

        # GPA trend (monthly)
        gpa_trend_a = [("Jan",7.2),("Feb",7.5),("Mar",7.8),("Apr",7.6),
                       ("May",8.0),("Jun",7.9),("Jul",8.1),("Aug",8.2),("Sep",8.4)]
        for period, gpa in gpa_trend_a:
            db.add(GpaRecord(student_id=profile_a.id, period=period, gpa=gpa, period_type="month"))

        # GPA by semester
        for sem, gpa in [("Sem 1",7.2),("Sem 2",7.6),("Sem 3",8.1),("Sem 4",8.4)]:
            db.add(GpaRecord(student_id=profile_a.id, period=sem, gpa=gpa, period_type="semester"))

        # Attendance trend
        attendance_a = [("W1",95),("W2",90),("W3",95),("W4",95),("W5",90),("W6",95),("W7",100),("W8",95)]
        for week, pct in attendance_a:
            db.add(AttendanceRecord(student_id=profile_a.id, week_label=week, pct=pct, semester=4))

        # Recommendations
        recs_a = [
            ("Review Algorithms — Graph Traversal",
             "Your Algorithms marks (78/100) are good but you can push to A+. Focus on DFS/BFS before the exam.",
             "Algorithms: 78/100 (Target: 80)", "Practice 5 graph problems this week.", "medium", "Exam Prep"),
            ("Visit Office Hours for OS doubts",
             "Operating Systems is your lowest scoring subject. Clearing concepts now helps before finals.",
             "OS Marks: 76/100 (Lowest this semester)", "Meet Prof. Nair during office hours (Tue/Thu 2-4 PM).", "low", "Support"),
        ]
        for title, exp, ind, action, priority, cat in recs_a:
            db.add(Recommendation(
                student_id=profile_a.id, title=title, explanation=exp,
                indicator=ind, action=action, priority=priority, category=cat
            ))

        # Risk Assessment
        db.add(RiskAssessment(
            student_id=profile_a.id, risk_level="Low", risk_score=0.12,
            factors=json.dumps({"attendance": "Good (95%)", "gpa": "Strong (8.4)", "assignments": "Excellent (90%)"})
        ))

        # Study tasks
        tasks_a = [
            ("Practice Graph Algorithms — 5 problems", "Algorithms", "2026-10-17", "medium"),
            ("Read OS Chapter 5 — Deadlocks",          "Operating Systems", "2026-10-15", "low"),
            ("Submit Networks Assignment 3",            "Computer Networks", "2026-10-14", "high"),
        ]
        for title, subj, due, pri in tasks_a:
            db.add(StudyTask(user_id=user_a.id, title=title, subject=subj, due_date=due, priority=pri))

        # Notifications
        db.add(Notification(
            user_id=user_a.id, type="success",
            title="Database Systems — Top 5%",
            message="You scored 90/100 in Database Systems — excellent work! You're in the top 5% of your class."
        ))
        db.add(Notification(
            user_id=user_a.id, type="info",
            title="New Study Recommendations",
            message="2 personalized study recommendations have been added based on your recent performance."
        ))

    # ─── Student B: Ravi Mehta ────────────────────────────────────────────
    if not db.query(User).filter(User.email == "studentb@eduinsight.com").first():
        user_b = User(
            uid=_uid(),
            email="studentb@eduinsight.com",
            hashed_pw=hash_password("StudentB@123"),
            name="Ravi Mehta",
            role="student",
            department="Electronics & Communication",
        )
        db.add(user_b)
        db.flush()

        profile_b = StudentProfile(user_id=user_b.id, student_code="STU-2024-0085", semester=3)
        db.add(profile_b)
        db.flush()

        # Subject results for Student B (at-risk student)
        subjects_b = [
            ("Mathematics II",       "MA201", 62, 100, "B",  3, 3, "Prof. K. Iyer",   65),
            ("Digital Electronics",  "EC201", 58, 100, "B-", 3, 4, "Prof. A. Sharma", 65),
            ("Signals & Systems",    "EC202", 55, 100, "C+", 3, 4, "Prof. P. Raj",    65),
            ("Electromagnetic Theory","EC203",70, 100, "B+", 3, 3, "Prof. R. Pillai", 65),
            ("Circuit Analysis",     "EC204", 64, 100, "B",  3, 3, "Prof. S. Kumar",  65),
            ("Engineering Maths",    "MA202", 68, 100, "B",  3, 3, "Prof. L. Singh",  65),
        ]
        for subj, code, marks, mx, grade, sem, credits, teacher, target in subjects_b:
            db.add(SubjectResult(
                student_id=profile_b.id, subject=subj, code=code,
                marks=marks, max_marks=mx, grade=grade, semester=sem,
                credits=credits, teacher=teacher, target=target
            ))

        # GPA trend (monthly) — declining pattern
        gpa_trend_b = [("Jan",7.0),("Feb",6.8),("Mar",6.5),("Apr",6.3),
                       ("May",6.5),("Jun",6.2),("Jul",5.9),("Aug",6.1),("Sep",6.2)]
        for period, gpa in gpa_trend_b:
            db.add(GpaRecord(student_id=profile_b.id, period=period, gpa=gpa, period_type="month"))

        for sem, gpa in [("Sem 1",7.1),("Sem 2",6.8),("Sem 3",6.2)]:
            db.add(GpaRecord(student_id=profile_b.id, period=sem, gpa=gpa, period_type="semester"))

        # Attendance trend — low
        attendance_b = [("W1",80),("W2",75),("W3",70),("W4",80),("W5",65),("W6",72),("W7",80),("W8",76)]
        for week, pct in attendance_b:
            db.add(AttendanceRecord(student_id=profile_b.id, week_label=week, pct=pct, semester=3))

        # Recommendations for Student B (stronger interventions)
        recs_b = [
            ("URGENT: Attend all remaining classes",
             "Your attendance has fallen to 76%. Below 75% risks exam disqualification this semester.",
             "Attendance: 76% (Minimum required: 75%)",
             "Attend every class for the next 4 weeks without exception. Inform faculty in advance of any unavoidable absences.",
             "high", "Attendance"),
            ("Improve Signals & Systems — Seek Tutoring",
             "Your Signals & Systems marks (55/100) are significantly below target (65). This is your lowest performing subject.",
             "Signals & Systems: 55/100 (Below pass threshold in some assessments)",
             "Join the peer tutoring group that meets Mondays 4–6 PM. Complete exercises from Chapters 3 and 4 this week.",
             "high", "Academic"),
            ("Complete Missing Assignments",
             "Your assignment completion rate is 65% — 35% of assignments are incomplete or not submitted.",
             "Assignments: 65% completion (Target: 80%)",
             "List all pending assignments and set a 2-per-week completion goal. Visit the academic help desk if you need topic guidance.",
             "high", "Assignment"),
            ("Meet Your Academic Advisor",
             "Multiple performance indicators suggest you may benefit from an academic support plan.",
             "GPA: 6.2 (declining trend over 3 semesters)",
             "Book an appointment with Dr. Meena Iyer (advisor) at the Student Support Center this week.",
             "medium", "Support"),
        ]
        for title, exp, ind, action, priority, cat in recs_b:
            db.add(Recommendation(
                student_id=profile_b.id, title=title, explanation=exp,
                indicator=ind, action=action, priority=priority, category=cat
            ))

        # Risk Assessment
        db.add(RiskAssessment(
            student_id=profile_b.id, risk_level="High", risk_score=0.81,
            factors=json.dumps({
                "attendance": "Critical (76%) — near eligibility threshold",
                "gpa": "Declining (6.2, down 3 semesters)",
                "assignments": "Low completion (65%)",
                "engagement": "Reduced LMS activity"
            })
        ))

        # Study tasks
        tasks_b = [
            ("Complete all pending assignments (3 overdue)", "Multiple", "2026-10-13", "high"),
            ("Attend Signals & Systems tutoring session",    "Signals & Systems", "2026-10-14", "high"),
            ("Read Digital Electronics — Chapter 4",         "Digital Electronics", "2026-10-16", "medium"),
        ]
        for title, subj, due, pri in tasks_b:
            db.add(StudyTask(user_id=user_b.id, title=title, subject=subj, due_date=due, priority=pri))

        # Notifications
        db.add(Notification(
            user_id=user_b.id, type="warning",
            title="Attendance Warning — Risk of Disqualification",
            message="Your attendance is at 76%. You need at least 75% to appear in final exams. Please attend all classes immediately."
        ))
        db.add(Notification(
            user_id=user_b.id, type="warning",
            title="Signals & Systems — Below Target",
            message="Your marks in Signals & Systems (55/100) are below the required threshold. Tutoring resources are available."
        ))
        db.add(Notification(
            user_id=user_b.id, type="info",
            title="Academic Advisor Meeting Suggested",
            message="Based on your academic profile, Dr. Meena Iyer has flagged you for a support consultation. Please book an appointment."
        ))

    # ─── Original demo accounts (for backward compatibility) ─────────────
    _seed_role_account(db, "student@eduinsight.com", "student123",
                       "Ananya Patel", "student", "Computer Science",
                       "STU-2024-0042")

    _seed_admin(db, "admin@eduinsight.com", "admin123", "Dr. Priya Sharma")
    _seed_staff(db, "faculty@eduinsight.com", "faculty123", "Prof. Rajesh Kumar", "faculty", "Computer Science")
    _seed_staff(db, "advisor@eduinsight.com", "advisor123", "Dr. Meena Iyer", "advisor", "Academic Advisory")
    _seed_staff(db, "parent@eduinsight.com",  "parent123",  "Vikram Patel",   "parent",  "")

    db.commit()
    print("[OK] Demo data seeded successfully.")


def _seed_role_account(db, email, password, name, role, dept, student_code=None):
    """Seed a generic role account with full student data if it's a student."""
    if db.query(User).filter(User.email == email).first():
        return  # Already exists — skip

    user = User(uid=_uid(), email=email, hashed_pw=hash_password(password),
                name=name, role=role, department=dept)
    db.add(user)
    db.flush()

    if role == "student" and student_code:
        # Check by user_id (not student_code) so every student user gets their own profile
        if not db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first():
            # Use a unique code if the requested code is already taken
            code_taken = db.query(StudentProfile).filter(StudentProfile.student_code == student_code).first()
            actual_code = student_code if not code_taken else f"{student_code}-L"
            profile = StudentProfile(user_id=user.id, student_code=actual_code, semester=4)
            db.add(profile)
            db.flush()
            _add_student_a_data(db, profile)


def _seed_admin(db, email, password, name):
    if db.query(User).filter(User.email == email).first():
        return
    db.add(User(uid=_uid(), email=email, hashed_pw=hash_password(password),
                name=name, role="admin", department="Administration"))


def _seed_staff(db, email, password, name, role, dept):
    if db.query(User).filter(User.email == email).first():
        return
    db.add(User(uid=_uid(), email=email, hashed_pw=hash_password(password),
                name=name, role=role, department=dept))


def _add_student_a_data(db, profile):
    """Reuse Student A's academic data for the original demo student account."""
    subjects = [
        ("Mathematics III",   "MA301", 85, 100, "A",  4, 3, "Prof. K. Iyer",  85),
        ("Data Structures",   "CS301", 82, 100, "A",  4, 4, "Prof. R. Kumar", 80),
        ("Algorithms",        "CS302", 78, 100, "A",  4, 4, "Prof. S. Menon", 80),
        ("Database Systems",  "CS303", 90, 100, "A+", 4, 3, "Prof. A. Desai", 85),
        ("Operating Systems", "CS304", 76, 100, "A",  4, 4, "Prof. V. Nair",  75),
        ("Computer Networks", "CS305", 88, 100, "A+", 4, 3, "Prof. M. Singh", 80),
    ]
    for s, code, marks, mx, grade, sem, credits, teacher, target in subjects:
        db.add(SubjectResult(student_id=profile.id, subject=s, code=code,
                             marks=marks, max_marks=mx, grade=grade, semester=sem,
                             credits=credits, teacher=teacher, target=target))

    for period, gpa in [("Jan",7.2),("Feb",7.5),("Mar",7.8),("Apr",7.6),
                        ("May",8.0),("Jun",7.9),("Jul",8.1),("Aug",8.2),("Sep",8.4)]:
        db.add(GpaRecord(student_id=profile.id, period=period, gpa=gpa, period_type="month"))

    for sem, gpa in [("Sem 1",7.2),("Sem 2",7.6),("Sem 3",8.1),("Sem 4",8.4)]:
        db.add(GpaRecord(student_id=profile.id, period=sem, gpa=gpa, period_type="semester"))

    for week, pct in [("W1",95),("W2",90),("W3",95),("W4",95),("W5",90),("W6",95),("W7",100),("W8",95)]:
        db.add(AttendanceRecord(student_id=profile.id, week_label=week, pct=pct, semester=4))

    db.add(RiskAssessment(
        student_id=profile.id, risk_level="Low", risk_score=0.12,
        factors=json.dumps({"attendance": "Good (95%)", "gpa": "Strong (8.4)", "assignments": "Excellent (90%)"})
    ))
def repair_missing_profiles(db: Session):
    """
    Run at startup: finds any 'student' User with no StudentProfile and creates one.
    This fixes: newly registered students, or seeding edge-cases where a profile
    was skipped because of a duplicate student_code collision.
    """
    students_without_profile = (
        db.query(User)
        .filter(User.role == "student")
        .filter(
            ~db.query(StudentProfile)
            .filter(StudentProfile.user_id == User.id)
            .exists()
        )
        .all()
    )
    fixed = 0
    for user in students_without_profile:
        # Assign a unique student code based on uid
        code = f"STU-{user.uid[-8:]}"
        # Ensure uniqueness
        if db.query(StudentProfile).filter(StudentProfile.student_code == code).first():
            code = f"STU-{user.uid}"
        profile = StudentProfile(user_id=user.id, student_code=code, semester=1)
        db.add(profile)
        db.flush()
        fixed += 1
        print(f"[REPAIR] Created missing profile for {user.email} -> code={code}")
    if fixed:
        db.commit()
        print(f"[REPAIR] Fixed {fixed} student(s) with missing profiles.")


def seed_assessments_and_quizzes(db: Session):
    """Seed assessments and quizzes for students across subjects."""
    # ── 1. Quizzes & Questions ────────────────────────────────────────────────
    if db.query(Quiz).count() == 0:
        quizzes_data = [
            {
                "title": "Data Structures: Trees, Graphs & Hash Tables",
                "subject": "Data Structures",
                "code": "CS301",
                "topic": "Trees & Graph Traversal",
                "description": "Test your understanding of Binary Search Trees, Graph Traversals (BFS/DFS), and Hash Table collision strategies.",
                "difficulty": "Intermediate",
                "duration_minutes": 15,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "What is the worst-case time complexity of searching an element in an unbalanced Binary Search Tree (BST)?",
                        "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n log n)",
                        "correct": "C",
                        "explanation": "In the worst case where keys are inserted in sorted order, the BST degenerates into a linear chain (like a linked list), making search O(n)."
                    },
                    {
                        "text": "Which data structure follows the strict LIFO (Last In First Out) operational principle?",
                        "a": "Queue", "b": "Stack", "c": "Binary Heap", "d": "Circular Queue",
                        "correct": "B",
                        "explanation": "A Stack operates on LIFO semantics, meaning the most recently added element is the first one removed."
                    },
                    {
                        "text": "Which graph traversal algorithm uses a FIFO Queue for exploring vertex levels?",
                        "a": "Depth-First Search (DFS)", "b": "Breadth-First Search (BFS)", "c": "Dijkstra's Algorithm", "d": "Topological Sort",
                        "correct": "B",
                        "explanation": "Breadth-First Search (BFS) explores all neighbors at the present depth level before moving deeper, relying on a FIFO Queue."
                    },
                    {
                        "text": "Under ideal conditions with a good hash function, what is the average lookup time for a Hash Table?",
                        "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n^2)",
                        "correct": "A",
                        "explanation": "A uniformly distributed hash table achieves constant time O(1) average performance for insertions, deletions, and lookups."
                    },
                    {
                        "text": "In a min-heap containing n elements, what is the time complexity to extract the minimum element and restore the heap property?",
                        "a": "O(1)", "b": "O(log n)", "c": "O(n)", "d": "O(n log n)",
                        "correct": "B",
                        "explanation": "Extracting the root takes O(1), and heapifying down to restore the heap invariant takes O(log n) height operations."
                    }
                ]
            },
            {
                "title": "Algorithms: Design Paradigms & Complexity",
                "subject": "Algorithms",
                "code": "CS302",
                "topic": "Dynamic Programming & Greedy Analysis",
                "description": "Assess asymptotic analysis, Dynamic Programming principles, and Greedy algorithmic proofs.",
                "difficulty": "Advanced",
                "duration_minutes": 15,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "What is the expected average-case time complexity of Randomized QuickSort?",
                        "a": "O(n)", "b": "O(n log n)", "c": "O(n^2)", "d": "O(log n)",
                        "correct": "B",
                        "explanation": "Randomized QuickSort splits the array with balanced expected partitions, yielding O(n log n) average time complexity."
                    },
                    {
                        "text": "Which fundamental properties must a problem satisfy to be solvable via Dynamic Programming?",
                        "a": "Greedy choice property and optimal substructure",
                        "b": "Overlapping subproblems and optimal substructure",
                        "c": "Divide-and-conquer and random choice",
                        "d": "Linear independence and continuous relaxation",
                        "correct": "B",
                        "explanation": "Dynamic Programming requires optimal substructure (optimal solution contains optimal sub-solutions) and overlapping subproblems (memoization/tabulation benefit)."
                    },
                    {
                        "text": "Dijkstra's single-source shortest path algorithm fails or produces incorrect results when:",
                        "a": "The graph contains cycles",
                        "b": "Edge weights are negative",
                        "c": "The graph is directed",
                        "d": "All vertices have even degrees",
                        "correct": "B",
                        "explanation": "Dijkstra relies on greedy non-decreasing path lengths. Negative edge weights invalidate its greedy choice; Bellman-Ford must be used instead."
                    },
                    {
                        "text": "The Master Theorem can be used to solve which type of recurrences directly?",
                        "a": "T(n) = a*T(n/b) + f(n)",
                        "b": "T(n) = T(n-1) + T(n-2)",
                        "c": "T(n) = T(n-1) + n",
                        "d": "T(n) = 2^n * T(1)",
                        "correct": "A",
                        "explanation": "Master Theorem applies specifically to divide-and-conquer recurrences of form T(n) = a*T(n/b) + f(n) where a >= 1 and b > 1."
                    },
                    {
                        "text": "What is the worst-case space complexity of Depth First Search on a tree of depth d?",
                        "a": "O(1)", "b": "O(d)", "c": "O(2^d)", "d": "O(d^2)",
                        "correct": "B",
                        "explanation": "DFS only maintains the current path from the root to the leaf node on the call stack, requiring O(d) auxiliary space."
                    }
                ]
            },
            {
                "title": "Database Systems: SQL & Normalization",
                "subject": "Database Systems",
                "code": "CS303",
                "topic": "Relational Theory & ACID",
                "description": "Master SQL query structures, 1NF-BCNF normalization, indexing, and transaction properties.",
                "difficulty": "Intermediate",
                "duration_minutes": 12,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "A relation is in Second Normal Form (2NF) if it is in 1NF and contains no:",
                        "a": "Transitive dependencies",
                        "b": "Partial functional dependencies on candidate keys",
                        "c": "Foreign keys",
                        "d": "Primary key duplicates",
                        "correct": "B",
                        "explanation": "2NF requires every non-prime attribute to be fully functionally dependent on the entire primary key, eliminating partial dependencies."
                    },
                    {
                        "text": "What does the 'I' in ACID transaction guarantees ensure?",
                        "a": "Integrity of indexes",
                        "b": "Isolation of concurrent transactions from one another",
                        "c": "Instant durability to NVRAM",
                        "d": "Immutable commit logs",
                        "correct": "B",
                        "explanation": "Isolation guarantees that concurrent execution of transactions leaves the database in the same state as if they were run sequentially."
                    },
                    {
                        "text": "Which SQL clause must be used to filter groups produced by the GROUP BY clause?",
                        "a": "WHERE", "b": "HAVING", "c": "ORDER BY", "d": "LIMIT",
                        "correct": "B",
                        "explanation": "WHERE filters rows before aggregation, while HAVING filters aggregate groups after the GROUP BY execution."
                    },
                    {
                        "text": "How many Clustered Indexes can exist on a single relational table?",
                        "a": "Only 1", "b": "Up to 16", "c": "One for each column", "d": "Unlimited",
                        "correct": "A",
                        "explanation": "Because a clustered index dictates the actual physical ordering of rows on disk, a table can possess only one clustered index."
                    },
                    {
                        "text": "In a SQL foreign key definition, what does 'ON DELETE CASCADE' do when the parent row is deleted?",
                        "a": "Throws an integrity constraint violation error",
                        "b": "Sets foreign keys in child rows to NULL",
                        "c": "Automatically deletes matching rows in the child table",
                        "d": "Creates an archive replica table",
                        "correct": "C",
                        "explanation": "ON DELETE CASCADE propagates parent record deletions to all dependent foreign key rows in child tables automatically."
                    }
                ]
            },
            {
                "title": "Operating Systems: Concurrency & Memory",
                "subject": "Operating Systems",
                "code": "CS304",
                "topic": "Deadlocks, Paging & Scheduling",
                "description": "Examine deadlock avoidance, process scheduling algorithms, and virtual memory mechanics.",
                "difficulty": "Intermediate",
                "duration_minutes": 15,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "Which of the following is NOT one of Coffman's four necessary conditions for Deadlock?",
                        "a": "Mutual Exclusion",
                        "b": "Hold and Wait",
                        "c": "Preemption allowed",
                        "d": "Circular Wait",
                        "correct": "C",
                        "explanation": "Deadlock requires NO preemption. If preemption is allowed, resources can be taken away from processes, breaking deadlock."
                    },
                    {
                        "text": "What is the primary cause of 'Thrashing' in virtual memory systems?",
                        "a": "CPU clock throttling under high temperature",
                        "b": "Continuous page replacement due to pages exceeding working set size",
                        "c": "Disk head mechanical failure",
                        "d": "Corrupted Translation Lookaside Buffer entries",
                        "correct": "B",
                        "explanation": "Thrashing occurs when total memory demands exceed physical RAM, causing the operating system to spend more time swapping pages than executing instructions."
                    },
                    {
                        "text": "Which CPU scheduling algorithm can suffer significantly from the 'Convoy Effect'?",
                        "a": "Round Robin", "b": "Shortest Job First (SJF)", "c": "First-Come First-Served (FCFS)", "d": "Multi-Level Feedback Queue",
                        "correct": "C",
                        "explanation": "In FCFS, short processes get stuck queuing behind a long CPU-intensive process, causing poor average wait times (Convoy Effect)."
                    },
                    {
                        "text": "What hardware component caches recent virtual-to-physical address translations for rapid MMU lookup?",
                        "a": "L3 Cache", "b": "Translation Lookaside Buffer (TLB)", "c": "Instruction Register", "d": "DMA Controller",
                        "correct": "B",
                        "explanation": "The TLB is an associative memory cache inside the CPU that speeds up virtual-to-physical address translations."
                    },
                    {
                        "text": "What happens when a process invokes the wait() (or P()) operation on a semaphore with value <= 0?",
                        "a": "The semaphore resets to 1",
                        "b": "The process is blocked and placed on the waiting queue",
                        "c": "The OS terminates the process for deadlocking",
                        "d": "A SIGKILL signal is generated",
                        "correct": "B",
                        "explanation": "The wait() primitive decrements the semaphore counter; if the value becomes less than or equal to 0, the calling process blocks until signal() is executed."
                    }
                ]
            },
            {
                "title": "Computer Networks: Protocols & Architecture",
                "subject": "Computer Networks",
                "code": "CS305",
                "topic": "OSI Layers, TCP/IP & Sockets",
                "description": "Understand layer encapsulations, reliable transport via TCP, and network addressing standards.",
                "difficulty": "Beginner",
                "duration_minutes": 10,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "Which layer of the OSI reference model provides reliable end-to-end communication and port multiplexing?",
                        "a": "Network Layer", "b": "Transport Layer", "c": "Data Link Layer", "d": "Session Layer",
                        "correct": "B",
                        "explanation": "The Transport Layer (Layer 4) is responsible for process-to-process packet delivery, flow control, and reliability (e.g., TCP)."
                    },
                    {
                        "text": "How many packets are exchanged in the standard TCP connection establishment handshake?",
                        "a": "2 (SYN, ACK)", "b": "3 (SYN, SYN-ACK, ACK)", "c": "4 (SYN, ACK, DATA, FIN)", "d": "1 (CONNECT)",
                        "correct": "B",
                        "explanation": "TCP establishes a connection via a three-way handshake: Client sends SYN, Server replies SYN-ACK, Client confirms with ACK."
                    },
                    {
                        "text": "What is the standard IANA destination port used for secure HTTPS traffic?",
                        "a": "80", "b": "8080", "c": "443", "d": "22",
                        "correct": "C",
                        "explanation": "Port 443 is assigned by default to HTTPS (HTTP over TLS/SSL), whereas port 80 is used for unencrypted HTTP."
                    },
                    {
                        "text": "Which network protocol resolves a known IPv4 address to a local physical MAC hardware address?",
                        "a": "DNS", "b": "DHCP", "c": "ARP (Address Resolution Protocol)", "d": "ICMP",
                        "correct": "C",
                        "explanation": "ARP broadcasts on the local link asking 'Who has this IP?', and the corresponding device replies with its physical MAC address."
                    },
                    {
                        "text": "Which is an accurate characteristic of the User Datagram Protocol (UDP)?",
                        "a": "Guaranteed sequential byte delivery",
                        "b": "Connectionless, low-overhead transmission without retransmission guarantees",
                        "c": "Built-in congestion window management",
                        "d": "Requires symmetric encryption key exchange",
                        "correct": "B",
                        "explanation": "UDP is connectionless and sends datagrams without establishing a handshake or verifying delivery, making it ideal for low-latency streaming and gaming."
                    }
                ]
            },
            {
                "title": "Mathematics III: Probability & Linear Algebra",
                "subject": "Mathematics III",
                "code": "MA301",
                "topic": "Matrices, Eigenvalues & Probability",
                "description": "Test understanding of linear transformations, characteristic equations, and Bayes theorem.",
                "difficulty": "Intermediate",
                "duration_minutes": 15,
                "pass_percentage": 60.0,
                "semester": 4,
                "questions": [
                    {
                        "text": "For any square matrix A, the sum of all its eigenvalues equals:",
                        "a": "The determinant of A", "b": "The trace of A (sum of main diagonal elements)", "c": "The rank of A", "d": "Zero",
                        "correct": "B",
                        "explanation": "A core theorem of linear algebra establishes that the trace of a matrix equals the sum of its eigenvalues, and the determinant equals their product."
                    },
                    {
                        "text": "In a standard normal distribution, approximately what percentage of observations lie within 1 standard deviation of the mean?",
                        "a": "50.0%", "b": "68.2%", "c": "95.4%", "d": "99.7%",
                        "correct": "B",
                        "explanation": "The empirical 68-95-99.7 rule dictates that ~68.27% of values fall within [μ - σ, μ + σ] for a normal distribution."
                    },
                    {
                        "text": "If events A and B are statistically independent with P(A) = 0.4 and P(B) = 0.5, what is P(A ∩ B)?",
                        "a": "0.90", "b": "0.10", "c": "0.20", "d": "0.45",
                        "correct": "C",
                        "explanation": "For independent events, P(A ∩ B) = P(A) * P(B) = 0.4 * 0.5 = 0.20."
                    },
                    {
                        "text": "What is the determinant of an orthogonal matrix Q where Q^T * Q = I?",
                        "a": "Always 0", "b": "Either +1 or -1", "c": "Always +1", "d": "Equal to the dimension n",
                        "correct": "B",
                        "explanation": "det(Q^T * Q) = det(Q)^2 = det(I) = 1, which implies det(Q) = ±1."
                    },
                    {
                        "text": "Bayes' Theorem provides a mathematical formula for calculating:",
                        "a": "Joint probability of disjoint events",
                        "b": "Posterior probability updated from prior knowledge and evidence",
                        "c": "Standard error of the sample mean",
                        "d": "Matrix inversion complexity",
                        "correct": "B",
                        "explanation": "Bayes' Theorem: P(A|B) = [P(B|A) * P(A)] / P(B), calculating posterior probability given prior belief and observed evidence."
                    }
                ]
            },
            {
                "title": "Signals & Systems: Frequency & LTI Systems",
                "subject": "Signals & Systems",
                "code": "EC202",
                "topic": "Transforms & LTI Systems",
                "description": "Covers impulse response, convolution integral, and Laplace transform properties.",
                "difficulty": "Intermediate",
                "duration_minutes": 15,
                "pass_percentage": 60.0,
                "semester": 3,
                "questions": [
                    {
                        "text": "What mathematical operation relates the input x(t) and impulse response h(t) to the output y(t) of an LTI system?",
                        "a": "Cross-correlation", "b": "Convolution: y(t) = x(t) * h(t)", "c": "Dot product", "d": "Laplacian divergence",
                        "correct": "B",
                        "explanation": "Linear Time-Invariant (LTI) systems are completely characterized by their impulse response via the convolution integral."
                    },
                    {
                        "text": "What is the unilateral Laplace transform of the unit impulse function δ(t)?",
                        "a": "1/s", "b": "1", "c": "s", "d": "1/s^2",
                        "correct": "B",
                        "explanation": "The integral of δ(t)*e^(-st) dt from 0 to ∞ samples the exponential at t=0, which yields 1."
                    },
                    {
                        "text": "A continuous-time system is defined to be Causal if the current output y(t) depends only on:",
                        "a": "Future inputs x(t + τ)", "b": "Present and past inputs x(τ) for τ <= t", "c": "Even components only", "d": "Harmonics of the fundamental frequency",
                        "correct": "B",
                        "explanation": "Causality means an output cannot precede its input cause; it relies solely on present and historical inputs."
                    },
                    {
                        "text": "According to Nyquist-Shannon theorem, to avoid aliasing when sampling a signal with maximum frequency 4 kHz, the sampling frequency must be at least:",
                        "a": "2 kHz", "b": "4 kHz", "c": "8 kHz", "d": "16 kHz",
                        "correct": "C",
                        "explanation": "Nyquist rate is twice the maximum frequency: fs >= 2 * 4 kHz = 8 kHz."
                    },
                    {
                        "text": "For a continuous LTI system to be Bounded-Input Bounded-Output (BIBO) stable, the ROC of its transfer function H(s) must:",
                        "a": "Exclude the origin", "b": "Include the imaginary axis (jω-axis)", "c": "Be entirely in the right-half plane", "d": "Be empty",
                        "correct": "B",
                        "explanation": "BIBO stability requires absolute integrability of h(t), which implies the Region of Convergence (ROC) must contain the jω imaginary axis."
                    }
                ]
            }
        ]

        for qdata in quizzes_data:
            quiz = Quiz(
                title=qdata["title"],
                subject=qdata["subject"],
                code=qdata["code"],
                topic=qdata["topic"],
                description=qdata["description"],
                difficulty=qdata["difficulty"],
                duration_minutes=qdata["duration_minutes"],
                pass_percentage=qdata["pass_percentage"],
                semester=qdata["semester"],
            )
            db.add(quiz)
            db.flush()

            for q in qdata["questions"]:
                db.add(QuizQuestion(
                    quiz_id=quiz.id,
                    question_text=q["text"],
                    option_a=q["a"],
                    option_b=q["b"],
                    option_c=q["c"],
                    option_d=q["d"],
                    correct_option=q["correct"],
                    explanation=q["explanation"],
                    marks=1
                ))
        db.flush()

    # ── 2. Assessments ────────────────────────────────────────────────────────
    if db.query(Assessment).count() == 0:
        assessments_data = [
            # Semester 4
            {
                "title": "Data Structures Mid-Term Examination",
                "subject": "Data Structures",
                "code": "CS301",
                "type": "Mid-Term",
                "description": "Comprehensive mid-term examination evaluating binary search trees, balanced AVL rotations, hashing, and priority queues.",
                "max_marks": 100,
                "weightage_pct": 25,
                "semester": 4,
                "due_date": "2026-09-20"
            },
            {
                "title": "Algorithms Design & Complexity Lab",
                "subject": "Algorithms",
                "code": "CS302",
                "type": "Lab Practical",
                "description": "Programming lab assessment: implementation of asymptotic analysis benchmarks and Dijkstra's shortest path routing algorithm.",
                "max_marks": 50,
                "weightage_pct": 15,
                "semester": 4,
                "due_date": "2026-10-05"
            },
            {
                "title": "Database SQL & Normalization Unit Test",
                "subject": "Database Systems",
                "code": "CS303",
                "type": "Unit Test",
                "description": "Theoretical and SQL problem sets covering BCNF decomposition, relational algebra, and subquery optimization.",
                "max_marks": 50,
                "weightage_pct": 15,
                "semester": 4,
                "due_date": "2026-10-18"
            },
            {
                "title": "Operating Systems Concurrency Assignment",
                "subject": "Operating Systems",
                "code": "CS304",
                "type": "Assignment",
                "description": "Implement producer-consumer problem with POSIX semaphores and analyze Banker's algorithm safe sequence.",
                "max_marks": 40,
                "weightage_pct": 10,
                "semester": 4,
                "due_date": "2026-10-25"
            },
            {
                "title": "Computer Networks Packet Tracing Project",
                "subject": "Computer Networks",
                "code": "CS305",
                "type": "Project",
                "description": "Wireshark packet capture trace and analysis of TCP handshakes, TLS session negotiation, and DNS lookups.",
                "max_marks": 50,
                "weightage_pct": 15,
                "semester": 4,
                "due_date": "2026-11-02"
            },
            {
                "title": "Mathematics III Fourier Series Assessment",
                "subject": "Mathematics III",
                "code": "MA301",
                "type": "Unit Test",
                "description": "Problem set on Fourier transform pairs, half-range expansions, and differential boundary equations.",
                "max_marks": 50,
                "weightage_pct": 15,
                "semester": 4,
                "due_date": "2026-11-10"
            },
            # Semester 3
            {
                "title": "Signals & Systems Mid-Term Exam",
                "subject": "Signals & Systems",
                "code": "EC202",
                "type": "Mid-Term",
                "description": "Continuous-time and discrete-time signals, LTI systems, and convolution integral problems.",
                "max_marks": 100,
                "weightage_pct": 25,
                "semester": 3,
                "due_date": "2026-09-22"
            },
            {
                "title": "Digital Electronics Circuit Simulation Lab",
                "subject": "Digital Electronics",
                "code": "EC201",
                "type": "Lab Practical",
                "description": "Simulation and hardware testing of sequential flip-flops and 4-bit synchronous counters.",
                "max_marks": 50,
                "weightage_pct": 15,
                "semester": 3,
                "due_date": "2026-10-19"
            },
            {
                "title": "Circuit Analysis Theorem Problem Set",
                "subject": "Circuit Analysis",
                "code": "EC204",
                "type": "Assignment",
                "description": "Application of Thevenin, Norton, and Superposition network theorems in AC steady state circuits.",
                "max_marks": 40,
                "weightage_pct": 10,
                "semester": 3,
                "due_date": "2026-10-28"
            }
        ]

        for adata in assessments_data:
            db.add(Assessment(**adata))
        db.flush()

    # ── 3. Student Submissions & Initial Attempt History ───────────────────────
    # Link to Student A (Ananya Patel, Sem 4)
    user_a = db.query(User).filter(User.email == "studenta@eduinsight.com").first()
    if user_a and user_a.student_profile:
        profile_a = user_a.student_profile
        # Seed submissions if none exist
        if db.query(AssessmentSubmission).filter(AssessmentSubmission.student_id == profile_a.id).count() == 0:
            assessments_sem4 = db.query(Assessment).filter(Assessment.semester == 4).all()
            for asm in assessments_sem4:
                if asm.code == "CS301":  # Mid-Term
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_a.id,
                        status="Graded",
                        marks_obtained=86.0,
                        max_marks=100.0,
                        percentage=86.0,
                        grade="A",
                        feedback="Outstanding implementation of AVL tree rotations and thorough time complexity analysis.",
                        submission_text="Completed all questions including advanced AVL balance factor calculation proofs.",
                        submitted_at=datetime.utcnow() - timedelta(days=22),
                        graded_at=datetime.utcnow() - timedelta(days=20)
                    ))
                elif asm.code == "CS302":  # Lab Practical
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_a.id,
                        status="Graded",
                        marks_obtained=44.0,
                        max_marks=50.0,
                        percentage=88.0,
                        grade="A+",
                        feedback="Clean recursive algorithm design and passed all test suites including edge case graphs.",
                        submission_text="Submitted C++ and Python implementations for Dijkstra and Bellman-Ford comparisons.",
                        submitted_at=datetime.utcnow() - timedelta(days=7),
                        graded_at=datetime.utcnow() - timedelta(days=5)
                    ))
                elif asm.code == "CS303":  # Unit Test
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_a.id,
                        status="Graded",
                        marks_obtained=47.0,
                        max_marks=50.0,
                        percentage=94.0,
                        grade="A+",
                        feedback="Perfect BCNF decomposition proofs and excellent understanding of ACID transactions.",
                        submission_text="Answered normalization derivations and SQL aggregate queries.",
                        submitted_at=datetime.utcnow() - timedelta(days=2),
                        graded_at=datetime.utcnow() - timedelta(days=1)
                    ))
                elif asm.code in ("CS304", "CS305", "MA301"):
                    # Pending assessments for student to view/submit
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_a.id,
                        status="Pending",
                        max_marks=asm.max_marks
                    ))

        # Seed initial quiz attempts for Student A if none exist
        if db.query(QuizAttempt).filter(QuizAttempt.student_id == profile_a.id).count() == 0:
            quiz_ds = db.query(Quiz).filter(Quiz.code == "CS301").first()
            if quiz_ds:
                answers_ds = [
                    {"question_id": 1, "selected": "C", "correct": "C", "is_correct": True},
                    {"question_id": 2, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 3, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 4, "selected": "A", "correct": "A", "is_correct": True},
                    {"question_id": 5, "selected": "B", "correct": "B", "is_correct": True},
                ]
                db.add(QuizAttempt(
                    quiz_id=quiz_ds.id,
                    student_id=profile_a.id,
                    score=5.0,
                    max_score=5.0,
                    percentage=100.0,
                    passed=True,
                    total_questions=5,
                    correct_answers=5,
                    incorrect_answers=0,
                    unanswered=0,
                    answers_json=json.dumps(answers_ds),
                    time_taken_seconds=380,
                    completed_at=datetime.utcnow() - timedelta(days=3)
                ))

            quiz_db = db.query(Quiz).filter(Quiz.code == "CS303").first()
            if quiz_db:
                answers_db = [
                    {"question_id": 11, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 12, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 13, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 14, "selected": "A", "correct": "A", "is_correct": True},
                    {"question_id": 15, "selected": "B", "correct": "C", "is_correct": False},
                ]
                db.add(QuizAttempt(
                    quiz_id=quiz_db.id,
                    student_id=profile_a.id,
                    score=4.0,
                    max_score=5.0,
                    percentage=80.0,
                    passed=True,
                    total_questions=5,
                    correct_answers=4,
                    incorrect_answers=1,
                    unanswered=0,
                    answers_json=json.dumps(answers_db),
                    time_taken_seconds=310,
                    completed_at=datetime.utcnow() - timedelta(days=1)
                ))

    # Link to Student B (Ravi Mehta, Sem 3)
    user_b = db.query(User).filter(User.email == "studentb@eduinsight.com").first()
    if user_b and user_b.student_profile:
        profile_b = user_b.student_profile
        if db.query(AssessmentSubmission).filter(AssessmentSubmission.student_id == profile_b.id).count() == 0:
            assessments_sem3 = db.query(Assessment).filter(Assessment.semester == 3).all()
            for asm in assessments_sem3:
                if asm.code == "EC202":
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_b.id,
                        status="Graded",
                        marks_obtained=55.0,
                        max_marks=100.0,
                        percentage=55.0,
                        grade="C+",
                        feedback="Struggled with inverse Laplace transforms and convolution evaluation. Attend extra help session.",
                        submission_text="Attempted section A and partial section B.",
                        submitted_at=datetime.utcnow() - timedelta(days=20),
                        graded_at=datetime.utcnow() - timedelta(days=18)
                    ))
                elif asm.code in ("EC201", "EC204"):
                    db.add(AssessmentSubmission(
                        assessment_id=asm.id,
                        student_id=profile_b.id,
                        status="Pending",
                        max_marks=asm.max_marks
                    ))

        if db.query(QuizAttempt).filter(QuizAttempt.student_id == profile_b.id).count() == 0:
            quiz_sig = db.query(Quiz).filter(Quiz.code == "EC202").first()
            if quiz_sig:
                answers_sig = [
                    {"question_id": 31, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 32, "selected": "B", "correct": "B", "is_correct": True},
                    {"question_id": 33, "selected": "A", "correct": "B", "is_correct": False},
                    {"question_id": 34, "selected": "C", "correct": "C", "is_correct": True},
                    {"question_id": 35, "selected": "A", "correct": "B", "is_correct": False},
                ]
                db.add(QuizAttempt(
                    quiz_id=quiz_sig.id,
                    student_id=profile_b.id,
                    score=3.0,
                    max_score=5.0,
                    percentage=60.0,
                    passed=True,
                    total_questions=5,
                    correct_answers=3,
                    incorrect_answers=2,
                    unanswered=0,
                    answers_json=json.dumps(answers_sig),
                    time_taken_seconds=420,
                    completed_at=datetime.utcnow() - timedelta(days=2)
                ))

    db.commit()
    print("[SEED] Successfully seeded assessments and subject quizzes.")
