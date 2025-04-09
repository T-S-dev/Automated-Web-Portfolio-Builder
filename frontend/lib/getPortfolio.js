import { mongooseConnect } from "@/lib/mongoose.js";
import Portfolio from "@/models/Portfolio.js";

const getPortfolio = async (username) => {
  await mongooseConnect();

  // Find the portfolio by username and exclude the following fields:
  // clerkId, createdAt, updatedAt, __v, _id
  const portfolio = await Portfolio.findOne({ username }).select("-clerkId -createdAt -updatedAt -__v -_id").lean();

  if (!portfolio) {
    return null;
  }

  // Remove _id from objects in education, experience, projects, and certifications arrays
  ["education", "experience", "projects", "certifications"].forEach((field) => {
    if (portfolio[field]) {
      portfolio[field] = portfolio[field].map(({ _id, ...rest }) => rest);
    }
  });

  // Remove _id from nested objects
  if (portfolio.personal && portfolio.personal._id) {
    delete portfolio.personal._id;
  }

  // Remove _id from skills object
  if (portfolio.skills && portfolio.skills._id) {
    delete portfolio.skills._id;
  }

  return portfolio;
};

export default getPortfolio;
