const z = require('zod');

const userMainSchemaZod = z.object({
    is_admin: z.boolean().optional(),
    personal_email_id: z.string().email(),
    organization_email_id: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(1),
});

const userUpdatedSchemaZod = z.object({
    profile_image: z.string().optional(),
    phone_number: z.number().optional(),
    gender: z.string().optional(),
    department_name: z.string().optional(),
    researchPapers: z.array(z.string().length(24)).optional(),
    projects: z.array(z.string().length(24)).optional(),
    seminars: z.array(z.string().length(24)).optional(),
    certificates: z.array(z.string().length(24)).optional(),
    otherAchievements: z.array(z.string().length(24)).optional(),
    latestAcadmicFeedback: z.number().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

module.exports = { userMainSchemaZod, userUpdatedSchemaZod };