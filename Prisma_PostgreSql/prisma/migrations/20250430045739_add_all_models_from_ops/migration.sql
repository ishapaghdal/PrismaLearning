/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JsonUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_user_id_fkey";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "JsonUser";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "Client" (
    "client_id" VARCHAR(100) NOT NULL,
    "client_name" VARCHAR(200) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "project_id" VARCHAR(100) NOT NULL,
    "project_name" VARCHAR(200) NOT NULL,
    "archived" BOOLEAN DEFAULT false,
    "billable" BOOLEAN NOT NULL,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "project_state" VARCHAR(25) NOT NULL DEFAULT 'Unknown',
    "type" VARCHAR(25) NOT NULL DEFAULT 'Web',
    "description" TEXT,
    "phase" VARCHAR(25) NOT NULL DEFAULT 'Post Production',
    "close_remark" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "client_id" VARCHAR(100),
    "project_billing_type" VARCHAR(50),
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "ProjectDepartment" (
    "id" SERIAL NOT NULL,
    "project_id" VARCHAR(100) NOT NULL,
    "department_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employee_id" VARCHAR(100) NOT NULL,
    "employee_name" VARCHAR(200) NOT NULL,
    "employee_email" VARCHAR(100) NOT NULL,
    "employee_status" VARCHAR(100) NOT NULL,
    "join_date" DATE,
    "exit_date" DATE,
    "include_in_reports" BOOLEAN DEFAULT true,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "profile" VARCHAR(200),
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "is_staff" BOOLEAN NOT NULL,
    "is_superuser" BOOLEAN NOT NULL,
    "experience_before_joining" INTEGER,
    "employment_type" VARCHAR(255) NOT NULL DEFAULT 'Full Time',
    "contact" VARCHAR(20),
    "last_login" TIMESTAMPTZ(6),
    "password" VARCHAR(255),
    "device_id" TEXT,
    "keka_id" TEXT,
    "department_id" INTEGER NOT NULL DEFAULT 1,
    "customize_view" JSONB NOT NULL,
    "reporting_manager_id" TEXT,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" SERIAL NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "employee_id" VARCHAR(100) NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "skills_expertise_level_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "is_core_skill" BOOLEAN NOT NULL DEFAULT false,
    "notes" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEmployee" (
    "id" SERIAL NOT NULL,
    "allocated_time" INTEGER,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "is_billable" BOOLEAN NOT NULL DEFAULT false,
    "is_archive" BOOLEAN NOT NULL DEFAULT false,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "employee_id" VARCHAR(100) NOT NULL,
    "project_id" VARCHAR(100) NOT NULL,
    "role_id" INTEGER NOT NULL DEFAULT 4,
    "designation_alias_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignationAlias" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DesignationAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSPOC" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(100) NOT NULL,
    "project_id" VARCHAR(100) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectSPOC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContracts" (
    "id" SERIAL NOT NULL,
    "project_id" VARCHAR(100) NOT NULL,
    "contract_start_date" TIMESTAMPTZ(6) NOT NULL,
    "contract_end_date" TIMESTAMPTZ(6) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectContracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(15) NOT NULL DEFAULT 'Engineer',
    "is_associate_with_role" BOOLEAN NOT NULL,
    "is_associate_with_designation" BOOLEAN NOT NULL,
    "is_associate_with_allocation" BOOLEAN NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personalization" (
    "id" SERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "column_name" TEXT NOT NULL,
    "default_order" INTEGER NOT NULL,
    "default_selected" BOOLEAN NOT NULL DEFAULT true,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Personalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizationRolePermission" (
    "id" SERIAL NOT NULL,
    "personalization_id" INTEGER NOT NULL,
    "role_permission_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PersonalizationRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "department_name" VARCHAR(200) NOT NULL,
    "is_associate_with_department" BOOLEAN NOT NULL,
    "is_associate_with_skills" BOOLEAN NOT NULL,
    "is_associated_with_project_department" BOOLEAN NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultProjectTasks" (
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "default_task_id" VARCHAR(100) NOT NULL,
    "default_task_name" VARCHAR(200) NOT NULL,
    "default_task_template_id" INTEGER NOT NULL,

    CONSTRAINT "DefaultProjectTasks_pkey" PRIMARY KEY ("default_task_id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" SERIAL NOT NULL,
    "task_template_name" VARCHAR(200) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateMaster" (
    "id" SERIAL NOT NULL,
    "project_state" VARCHAR(25) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "project_id" VARCHAR(100) NOT NULL,
    "remark" VARCHAR(200),
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StateMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tag" VARCHAR(100) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "skill_tag_department_id" INTEGER NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTagDepartment" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "department_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SkillTagDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillsExpertiseLevels" (
    "id" SERIAL NOT NULL,
    "level" VARCHAR(100) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SkillsExpertiseLevels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEmployeeSkill" (
    "id" SERIAL NOT NULL,
    "project_employee_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "skills_expertise_levels_id" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ProjectEmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "updated_column" VARCHAR(200) NOT NULL,
    "updated_by" VARCHAR(100),
    "old_data" TEXT,
    "new_data" TEXT,
    "action_type" VARCHAR(25),
    "employee_id" VARCHAR(100),
    "project_id" VARCHAR(100),
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "task_id" VARCHAR(100) NOT NULL,
    "task_name" VARCHAR(200) NOT NULL,
    "billable" BOOLEAN NOT NULL,
    "project_id" VARCHAR(100),
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "PerPersonExpectedHour" (
    "id" SERIAL NOT NULL,
    "month_year" VARCHAR(200) NOT NULL,
    "number_of_days" INTEGER NOT NULL,
    "total_hours" INTEGER NOT NULL,
    "working_days" DATE[],
    "employee_id" VARCHAR(100),
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PerPersonExpectedHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncButtonStatus" (
    "id" SERIAL NOT NULL,
    "is_sync_enabled" BOOLEAN NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "SyncButtonStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "time_entry_id" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "duration" VARCHAR(100) NOT NULL,
    "billable" BOOLEAN NOT NULL,
    "employee_id" VARCHAR(100),
    "project_id" VARCHAR(100),
    "task_id" VARCHAR(100),
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("time_entry_id")
);

-- CreateTable
CREATE TABLE "WeeklyTimeSheetEntries" (
    "id" SERIAL NOT NULL,
    "month_year" VARCHAR(200) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "clocked_hours" DECIMAL(6,2) NOT NULL,
    "expected_hours" INTEGER NOT NULL,
    "is_defaulter" BOOLEAN NOT NULL,
    "employee_id" VARCHAR(100),
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WeeklyTimeSheetEntries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkDay" (
    "id" SERIAL NOT NULL,
    "month_year" VARCHAR(200) NOT NULL,
    "number_of_days" INTEGER NOT NULL,
    "total_hours" INTEGER NOT NULL,
    "working_days" DATE[],
    "created_ts" TIMESTAMPTZ(6) NOT NULL,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "WorkDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeWorkMode" (
    "id" SERIAL NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "work_mode" TEXT NOT NULL,
    "in_office_work_days" INTEGER NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeWorkMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" UUID NOT NULL,
    "keka_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" BOOLEAN NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "attendance_type_id" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLogs" (
    "id" UUID NOT NULL,
    "keka_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time_in" TIMETZ NOT NULL,
    "time_out" TIMETZ NOT NULL,
    "source" BOOLEAN NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AttendanceLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AttendanceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "course_url" VARCHAR(200) NOT NULL,
    "certificate_state" TEXT NOT NULL DEFAULT 'Under Review',
    "certificate_status" TEXT NOT NULL DEFAULT 'Available',
    "requested_by" TEXT NOT NULL,
    "authorized_by" TEXT,
    "authorizer_comment" VARCHAR(255),
    "requester_comment" VARCHAR(255) NOT NULL,
    "requested_at" TIMESTAMPTZ(6) NOT NULL,
    "authorized_at" TIMESTAMPTZ(6),
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificateOrganization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo" VARCHAR(2000),
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CertificateOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeCertificate" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(200) NOT NULL,
    "certificate_id" INTEGER NOT NULL,
    "issue_date" DATE,
    "expiry_date" DATE,
    "certificate_number" VARCHAR(200),
    "url" VARCHAR(300) NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "redirect_link" TEXT NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeNotification" (
    "id" SERIAL NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "employee_id" VARCHAR(100) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDeviceToken" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(100) NOT NULL,
    "device_token" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "created_ts" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_ts" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EmployeeDeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EmployeeToAttendance" (
    "A" UUID NOT NULL,
    "B" VARCHAR(100) NOT NULL,

    CONSTRAINT "_EmployeeToAttendance_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Client_client_id_fc42f907_like" ON "Client"("client_id");

-- CreateIndex
CREATE INDEX "Project_client_id_4b838055" ON "Project"("client_id");

-- CreateIndex
CREATE INDEX "Project_client_id_4b838055_like" ON "Project"("client_id");

-- CreateIndex
CREATE INDEX "Project_project_id_d6a3e507_like" ON "Project"("project_id");

-- CreateIndex
CREATE INDEX "Project_project_name_c0a0a36e" ON "Project"("project_name");

-- CreateIndex
CREATE INDEX "Project_project_name_c0a0a36e_like" ON "Project"("project_name");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_email_key" ON "Employee"("employee_email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_keka_id_key" ON "Employee"("keka_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_reporting_manager_id_key" ON "Employee"("reporting_manager_id");

-- CreateIndex
CREATE INDEX "Employee_employee_email_08560504_like" ON "Employee"("employee_email");

-- CreateIndex
CREATE INDEX "Employee_employee_id_fe00240c_like" ON "Employee"("employee_id");

-- CreateIndex
CREATE INDEX "Employee_employee_name_487e1283" ON "Employee"("employee_name");

-- CreateIndex
CREATE INDEX "Employee_employee_name_487e1283_like" ON "Employee"("employee_name");

-- CreateIndex
CREATE INDEX "Employee_role_id_81f969c0" ON "Employee"("role_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employee_id_6ce5c15d" ON "EmployeeSkill"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employee_id_6ce5c15d_like" ON "EmployeeSkill"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skill_id_00f5f54a" ON "EmployeeSkill"("skill_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skills_expertise_level_id_811f7a30" ON "EmployeeSkill"("skills_expertise_level_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employee_id_skill_id_5f247a79_uniq" ON "EmployeeSkill"("employee_id", "skill_id");

-- CreateIndex
CREATE INDEX "ProjectEmployee_employee_id_78067971" ON "ProjectEmployee"("employee_id");

-- CreateIndex
CREATE INDEX "ProjectEmployee_employee_id_78067971_like" ON "ProjectEmployee"("employee_id");

-- CreateIndex
CREATE INDEX "ProjectEmployee_project_id_4686d99d" ON "ProjectEmployee"("project_id");

-- CreateIndex
CREATE INDEX "ProjectEmployee_project_id_4686d99d_like" ON "ProjectEmployee"("project_id");

-- CreateIndex
CREATE INDEX "ProjectEmployee_role_id_612e8d8f" ON "ProjectEmployee"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "DesignationAlias_name_key" ON "DesignationAlias"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_id_permission_id_key" ON "RolePermission"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "Department_department_name_72789f5f" ON "Department"("department_name");

-- CreateIndex
CREATE INDEX "Department_department_name_72789f5f_like" ON "Department"("department_name");

-- CreateIndex
CREATE INDEX "DefaultProjectTasks_default_task_id_73109efd_like" ON "DefaultProjectTasks"("default_task_id");

-- CreateIndex
CREATE INDEX "DefaultProjectTasks_default_task_template_id_a0b30ff6" ON "DefaultProjectTasks"("default_task_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "DefaultProjectTasks_default_task_name_defaul_38aa1bd2_uniq" ON "DefaultProjectTasks"("default_task_name", "default_task_template_id");

-- CreateIndex
CREATE INDEX "StateMaster_project_id_0c885a3c" ON "StateMaster"("project_id");

-- CreateIndex
CREATE INDEX "StateMaster_project_id_0c885a3c_like" ON "StateMaster"("project_id");

-- CreateIndex
CREATE INDEX "ProjectEmployeeSkill_project_employee_id_4092cbfa" ON "ProjectEmployeeSkill"("project_employee_id");

-- CreateIndex
CREATE INDEX "ProjectEmployeeSkill_skill_id_fd523680" ON "ProjectEmployeeSkill"("skill_id");

-- CreateIndex
CREATE INDEX "ProjectEmployeeSkill_skills_expertise_levels_id_a99298ee" ON "ProjectEmployeeSkill"("skills_expertise_levels_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEmployeeSkill_project_employee_id_skil_9323e8b7_uniq" ON "ProjectEmployeeSkill"("project_employee_id", "skill_id", "skills_expertise_levels_id");

-- CreateIndex
CREATE INDEX "History_employee_id_3a5a7ecb" ON "History"("employee_id");

-- CreateIndex
CREATE INDEX "History_employee_id_3a5a7ecb_like" ON "History"("employee_id");

-- CreateIndex
CREATE INDEX "History_project_id_4342cc77" ON "History"("project_id");

-- CreateIndex
CREATE INDEX "History_project_id_4342cc77_like" ON "History"("project_id");

-- CreateIndex
CREATE INDEX "Task_project_id_2d1fd6af" ON "Task"("project_id");

-- CreateIndex
CREATE INDEX "Task_project_id_2d1fd6af_like" ON "Task"("project_id");

-- CreateIndex
CREATE INDEX "Task_task_id_244203d5_like" ON "Task"("task_id");

-- CreateIndex
CREATE INDEX "PerPersonExpectedHour_employee_id_4cd3d96f" ON "PerPersonExpectedHour"("employee_id");

-- CreateIndex
CREATE INDEX "PerPersonExpectedHour_employee_id_4cd3d96f_like" ON "PerPersonExpectedHour"("employee_id");

-- CreateIndex
CREATE INDEX "PerPersonExpectedHour_number_of_days_13d6680c" ON "PerPersonExpectedHour"("number_of_days");

-- CreateIndex
CREATE UNIQUE INDEX "PerPersonExpectedHour_employee_id_month_year_9efc7de5_uniq" ON "PerPersonExpectedHour"("employee_id", "month_year");

-- CreateIndex
CREATE INDEX "TimeEntry_employee_id_0bfcd508" ON "TimeEntry"("employee_id");

-- CreateIndex
CREATE INDEX "TimeEntry_employee_id_0bfcd508_like" ON "TimeEntry"("employee_id");

-- CreateIndex
CREATE INDEX "TimeEntry_project_id_89ad5ab3" ON "TimeEntry"("project_id");

-- CreateIndex
CREATE INDEX "TimeEntry_project_id_89ad5ab3_like" ON "TimeEntry"("project_id");

-- CreateIndex
CREATE INDEX "TimeEntry_task_id_608f12ce" ON "TimeEntry"("task_id");

-- CreateIndex
CREATE INDEX "TimeEntry_task_id_608f12ce_like" ON "TimeEntry"("task_id");

-- CreateIndex
CREATE INDEX "TimeEntry_time_entry_id_01d169a8_like" ON "TimeEntry"("time_entry_id");

-- CreateIndex
CREATE INDEX "WeeklyTimeSheetEntries_employee_id_c0b80b12" ON "WeeklyTimeSheetEntries"("employee_id");

-- CreateIndex
CREATE INDEX "WeeklyTimeSheetEntries_employee_id_c0b80b12_like" ON "WeeklyTimeSheetEntries"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyTimeSheetEntries_employee_id_start_date_e_6097e8e3_uniq" ON "WeeklyTimeSheetEntries"("employee_id", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "WorkDay_month_year_ebc1f7bb" ON "WorkDay"("month_year");

-- CreateIndex
CREATE INDEX "WorkDay_month_year_ebc1f7bb_like" ON "WorkDay"("month_year");

-- CreateIndex
CREATE INDEX "WorkDay_number_of_days_7b6e4348" ON "WorkDay"("number_of_days");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_keka_id_date_key" ON "Attendance"("keka_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLogs_keka_id_date_key" ON "AttendanceLogs"("keka_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_name_key" ON "Certificate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CertificateOrganization_name_key" ON "CertificateOrganization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeCertificate_employee_id_certificate_id_key" ON "EmployeeCertificate"("employee_id", "certificate_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeNotification_employee_id_notification_id_key" ON "EmployeeNotification"("employee_id", "notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDeviceToken_employee_id_device_id_key" ON "EmployeeDeviceToken"("employee_id", "device_id");

-- CreateIndex
CREATE INDEX "_EmployeeToAttendance_B_index" ON "_EmployeeToAttendance"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_client_id_4b838055_fk_Client_client_id" FOREIGN KEY ("client_id") REFERENCES "Client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectDepartment" ADD CONSTRAINT "ProjectDepartment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDepartment" ADD CONSTRAINT "ProjectDepartment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_role_id_81f969c0_fk_Role_id" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employee_id_6ce5c15d_fk_Employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skill_id_00f5f54a_fk_Skills_id" FOREIGN KEY ("skill_id") REFERENCES "Skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skills_expertise_lev_811f7a30_fk_SkillsExp" FOREIGN KEY ("skills_expertise_level_id") REFERENCES "SkillsExpertiseLevels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectEmployee" ADD CONSTRAINT "ProjectEmployee_designation_alias_id_fkey" FOREIGN KEY ("designation_alias_id") REFERENCES "DesignationAlias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEmployee" ADD CONSTRAINT "ProjectEmployee_employee_id_78067971_fk_Employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectEmployee" ADD CONSTRAINT "ProjectEmployee_project_id_4686d99d_fk_Project_project_id" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectEmployee" ADD CONSTRAINT "ProjectEmployee_role_id_612e8d8f_fk_Role_id" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectSPOC" ADD CONSTRAINT "ProjectSPOC_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSPOC" ADD CONSTRAINT "ProjectSPOC_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContracts" ADD CONSTRAINT "ProjectContracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizationRolePermission" ADD CONSTRAINT "PersonalizationRolePermission_personalization_id_fkey" FOREIGN KEY ("personalization_id") REFERENCES "Personalization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizationRolePermission" ADD CONSTRAINT "PersonalizationRolePermission_role_permission_id_fkey" FOREIGN KEY ("role_permission_id") REFERENCES "RolePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultProjectTasks" ADD CONSTRAINT "DefaultProjectTasks_default_task_templat_a0b30ff6_fk_TaskTempl" FOREIGN KEY ("default_task_template_id") REFERENCES "TaskTemplate"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StateMaster" ADD CONSTRAINT "StateMaster_project_id_0c885a3c_fk_Project_project_id" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Skills" ADD CONSTRAINT "Skills_skill_tag_department_id_fkey" FOREIGN KEY ("skill_tag_department_id") REFERENCES "SkillTagDepartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillTagDepartment" ADD CONSTRAINT "SkillTagDepartment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEmployeeSkill" ADD CONSTRAINT "ProjectEmployeeSkill_project_employee_id_4092cbfa_fk_ProjectEm" FOREIGN KEY ("project_employee_id") REFERENCES "ProjectEmployee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectEmployeeSkill" ADD CONSTRAINT "ProjectEmployeeSkill_skill_id_fd523680_fk_Skills_id" FOREIGN KEY ("skill_id") REFERENCES "Skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProjectEmployeeSkill" ADD CONSTRAINT "ProjectEmployeeSkill_skills_expertise_lev_a99298ee_fk_SkillsExp" FOREIGN KEY ("skills_expertise_levels_id") REFERENCES "SkillsExpertiseLevels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_employee_id_3a5a7ecb_fk_Employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_project_id_4342cc77_fk_Project_project_id" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_project_id_2d1fd6af_fk_Project_project_id" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PerPersonExpectedHour" ADD CONSTRAINT "PerPersonExpectedHou_employee_id_4cd3d96f_fk_Employee_" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_employee_id_0bfcd508_fk_Employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_project_id_89ad5ab3_fk_Project_project_id" FOREIGN KEY ("project_id") REFERENCES "Project"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_task_id_608f12ce_fk_Task_task_id" FOREIGN KEY ("task_id") REFERENCES "Task"("task_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WeeklyTimeSheetEntries" ADD CONSTRAINT "WeeklyTimeSheetEntri_employee_id_c0b80b12_fk_Employee_" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EmployeeWorkMode" ADD CONSTRAINT "History_employee_id_3a5a7ecb_fk_Employee_employee_id" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_keka_id_fkey" FOREIGN KEY ("keka_id") REFERENCES "Employee"("keka_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_attendance_type_id_fkey" FOREIGN KEY ("attendance_type_id") REFERENCES "AttendanceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLogs" ADD CONSTRAINT "AttendanceLogs_keka_id_date_fkey" FOREIGN KEY ("keka_id", "date") REFERENCES "Attendance"("keka_id", "date") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "CertificateOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_authorized_by_fkey" FOREIGN KEY ("authorized_by") REFERENCES "Employee"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertificate" ADD CONSTRAINT "EmployeeCertificate_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "Certificate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeCertificate" ADD CONSTRAINT "EmployeeCertificate_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNotification" ADD CONSTRAINT "EmployeeNotification_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeNotification" ADD CONSTRAINT "EmployeeNotification_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDeviceToken" ADD CONSTRAINT "EmployeeDeviceToken_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToAttendance" ADD CONSTRAINT "_EmployeeToAttendance_A_fkey" FOREIGN KEY ("A") REFERENCES "Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EmployeeToAttendance" ADD CONSTRAINT "_EmployeeToAttendance_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;
