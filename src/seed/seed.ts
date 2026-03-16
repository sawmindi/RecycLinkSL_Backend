import seedUsers from "./user-seed";
export default async function seed() {
    const users = await seedUsers();
}
