import mongoose from "mongoose";

const FunctionalAbiltiesSchema = new mongoose.Schema({
  firstName: {},
  lastName: {},
  telephone:{},
  address:{},
  cityTown:{},
  province:{},
  postalCode:{},
  dob:{},
  accidentDate:{},
  employerTelephone:{},
  employerFax:{},
  employerName:{},
  employerAddress:{},
  employercityTown:{},
  employerProvince:{},
  employerPost
});

const FunctionalAbilty = new mongoose.model(
  "FunctionalAbilty",
  FunctionalAbiltiesSchema
);
