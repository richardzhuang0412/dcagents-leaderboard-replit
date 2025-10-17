CREATE TABLE "benchmark_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_name" text NOT NULL,
	"agent_name" text NOT NULL,
	"benchmark_name" text NOT NULL,
	"accuracy" double precision NOT NULL,
	"standard_error" double precision NOT NULL
);
