import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding...')
  
  // Clean up existing data
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.user.deleteMany()

  // Create mock recruiter
  const hashedRecruiterPassword = await bcrypt.hash('password123', 10)
  const recruiter = await prisma.user.create({
    data: {
      name: 'Sarah (Google Recruiter)',
      email: 'recruiter@example.com',
      password: hashedRecruiterPassword,
      role: 'RECRUITER'
    }
  })

  // Create mock applicant
  const hashedApplicantPassword = await bcrypt.hash('password123', 10)
  const applicant = await prisma.user.create({
    data: {
      name: 'Alex Developer',
      email: 'applicant@example.com',
      password: hashedApplicantPassword,
      role: 'APPLICANT'
    }
  })

  // Create dummy jobs
  const jobs = [
    {
      title: 'Senior Frontend Engineer',
      company: 'TechCorp',
      location: 'Remote (US)',
      salary: '$130k - $160k',
      description: 'We are looking for an experienced Frontend Engineer with deep React and Next.js knowledge to lead our core product team. You will be building highly interactive web applications...',
      recruiterId: recruiter.id
    },
    {
      title: 'Backend Developer (Node.js)',
      company: 'DataSys',
      location: 'New York, NY',
      salary: '$120k - $145k',
      description: 'Join our backend team to build scalable microservices using Node.js, Express, and PostgreSQL. Experience with Docker and AWS is a huge plus.',
      recruiterId: recruiter.id
    },
    {
      title: 'Full Stack Web Developer',
      company: 'StartupX',
      location: 'San Francisco, CA',
      salary: '$140k - $170k',
      description: 'Looking for a generalist who can work across the stack. You will be using React on the frontend and Node/Prisma on the backend.',
      recruiterId: recruiter.id
    },
    {
      title: 'UI/UX Designer',
      company: 'CreativeAgency',
      location: 'Remote (Global)',
      salary: '$90k - $110k',
      description: 'We need a creative designer to revamp our client portals. You should be proficient in Figma and understand basic HTML/CSS constraints.',
      recruiterId: recruiter.id
    }
  ]

  for (const job of jobs) {
    await prisma.job.create({ data: job })
  }

  console.log('Seeding completed successfully.')
  console.log('Test Recruiter: recruiter@example.com / password123')
  console.log('Test Applicant: applicant@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
