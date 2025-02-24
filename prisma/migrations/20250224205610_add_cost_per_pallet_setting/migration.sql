-- Add cost per pallet setting
INSERT INTO "SystemSetting" ("key", "value", "type", "description")
VALUES ('costPerPallet', '0', 'number', 'Cost per pallet for request calculations');

-- Add enable cost calculation setting
INSERT INTO "SystemSetting" ("key", "value", "type", "description")
VALUES ('enableCostCalculation', 'false', 'boolean', 'Enable cost calculation for requests');
