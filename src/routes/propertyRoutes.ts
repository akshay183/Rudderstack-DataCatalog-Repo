import { Router } from "express";
import {
  create_property,
  get_all_properties,
  get_property_by_id,
  update_property,
  delete_property,
} from "../controllers/propertyController";
import {
  handleValidationErrors,
  validateUpdateProperty,
  validate_property,
} from "../middleware/validationMiddleware";

const router = Router();

router.post("/", validate_property, handleValidationErrors, create_property);
router.get("/", get_all_properties);
router.get("/:id", get_property_by_id);
router.put(
  "/:id",
  validateUpdateProperty,
  handleValidationErrors,
  update_property
);
router.delete("/:id", delete_property);

export default router;
