package db

import (
	"fmt"
	"log"
	"os"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
	"github.com/the-sage-group/awyes/proto"
)

// Connect establishes a connection to PostgreSQL and initializes the schema
func Connect() *pg.DB {
	// Connect to PostgreSQL
	db := pg.Connect(&pg.Options{
		User:     os.Getenv("POSTGRES_USER"),
		Password: os.Getenv("POSTGRES_PASSWORD"),
		Database: os.Getenv("POSTGRES_DB"),
		Addr:     fmt.Sprintf("%s:%s", os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_PORT")),
	})

	// Create the db tables
	for _, model := range []interface{}{(*proto.Route)(nil), (*proto.Handler)(nil)} {
		err := db.Model(model).CreateTable(&orm.CreateTableOptions{
			IfNotExists:   true,
			FKConstraints: true,
			Temp:          false,
		})
		if err != nil {
			log.Fatalf("failed to create table: %v", err)
		}
	}

	if _, err := db.Exec(`
		DO $$
		BEGIN
		    -- Add unique constraint for handlers if it doesn't exist
		    IF NOT EXISTS (
		        SELECT 1 FROM pg_constraint 
		        WHERE conname = 'handlers_context_name_key'
		    ) THEN
		        ALTER TABLE handlers 
		        ADD CONSTRAINT handlers_context_name_key 
		        UNIQUE (context, name);
		    END IF;

		    -- Add unique constraint for routes if it doesn't exist
		    IF NOT EXISTS (
		        SELECT 1 FROM pg_constraint 
		        WHERE conname = 'routes_context_name_key'
		    ) THEN
		        ALTER TABLE routes 
		        ADD CONSTRAINT routes_context_name_key 
		        UNIQUE (context, name);
		    END IF;
		END $$;`); err != nil {
		log.Fatalf("failed to add unique constraints: %v", err)
	}

	return db
}
