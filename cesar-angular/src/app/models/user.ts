export class User {
	constructor(
		public _id: string,
		public name: string,
		public lastname: string,
		public nick: string,
		public email: string,
		public password: string,
		public role: string,
		public image: string,
		public created_at: string
	) {}

}