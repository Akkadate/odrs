/**
 * Script to fix language enum in database
 */
const { sequelize } = require('./server/src/config/db');

async function fixLanguageField() {
  try {
    console.log('Checking language field in Requests table...');
    
    // First, check the current enum values
    const [languageEnumValues] = await sequelize.query(
      'SELECT unnest(enum_range(NULL::"enum_Requests_language"))::text;'
    );
    
    console.log('Current language enum values:', languageEnumValues);
    
    // Using SQL to directly update the enum type to include both styles of language codes
    try {
      console.log('Adding th/en to enum type...');
      await sequelize.query("ALTER TYPE \"enum_Requests_language\" ADD VALUE 'th';");
      console.log('Added th to enum type');
    } catch (err) {
      console.log('Could not add th (may already exist):', err.message);
    }
    
    try {
      await sequelize.query("ALTER TYPE \"enum_Requests_language\" ADD VALUE 'en';");
      console.log('Added en to enum type');
    } catch (err) {
      console.log('Could not add en (may already exist):', err.message);
    }
    
    // Verify the updated enum values
    const [updatedLanguageEnum] = await sequelize.query(
      'SELECT unnest(enum_range(NULL::"enum_Requests_language"))::text;'
    );
    
    console.log('Updated language enum values:', updatedLanguageEnum);
    console.log('Language field fix completed');
  } catch (error) {
    console.error('Error fixing language field:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the fix
fixLanguageField();
