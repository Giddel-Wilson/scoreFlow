export type Role = 'LECTURER' | 'HOD' | 'ADMIN';

export interface User {
	id: number;
	name: string;
	email: string;
	role: Role;
	departmentId?: number;
	department?: Department;
}

export interface Department {
	id: number;
	name: string;
}

export interface Course {
	id: number;
	code: string;
	title: string;
	level: number;
	semester: number;
	session: string;
	departmentId: number;
	department?: Department;
}

export interface Student {
	id: number;
	name: string;
	regNo: string;
	departmentId: number;
	level: number;
	activeStatus: boolean;
}

export interface CAScore {
	id: number;
	courseId: number;
	studentId: number;
	score?: number;
	isSubmitted: boolean;
	submittedBy: number;
	createdAt: Date;
	updatedAt: Date;
	course?: Course;
	student?: Student;
	submittedByUser?: User;
}

export interface CourseWithAssignment extends Course {
	courseAssignments: Array<{
		id: number;
		userId: number;
		user: User;
	}>;
}

export interface StudentWithScore extends Student {
	score?: CAScore;
}
