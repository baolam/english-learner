import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all Todos that are "[Hệ thống]"
  const systemTodos = await prisma.todo.findMany({
    where: {
      title: {
        contains: '[Hệ thống]'
      }
    }
  });

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  for (const todo of systemTodos) {
    // Create equivalent Schedule (Event)
    await prisma.schedule.create({
      data: {
        title: todo.title,
        description: todo.description,
        startTime: now,
        endTime: nextMonth, // Make it a long-term event (1 month)
      }
    });

    // Delete the old Todo
    await prisma.todo.delete({
      where: { id: todo.id }
    });
  }

  console.log(`Migrated ${systemTodos.length} system tasks from Todo to Schedule.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
