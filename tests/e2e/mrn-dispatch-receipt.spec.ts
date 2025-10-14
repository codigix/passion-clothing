import { test, expect } from '@playwright/test';
import { LoginPage, ApiHelpers } from './fixtures/page-objects.js';
import { testUsers } from './fixtures/test-data.js';

type MaterialItem = Record<string, any>;

test.describe('MRN dispatch to receipt workflow', () => {
  let apiHelpers: ApiHelpers;
  let createdMrnId: number | undefined;
  let createdMrnNumber: string | undefined;
  let createdDispatchId: number | undefined;
  let createdReceiptId: number | undefined;
  let dispatchMaterials: MaterialItem[];

  test.beforeEach(async ({ page }) => {
    apiHelpers = new ApiHelpers(page);
    createdMrnId = undefined;
    createdMrnNumber = undefined;
    createdDispatchId = undefined;
    createdReceiptId = undefined;
    dispatchMaterials = [];
  });

  test.afterEach(async () => {
    if (!apiHelpers) {
      return;
    }

    const cleanupPayload = {
      mrnIds: createdMrnId ? [createdMrnId] : [],
      dispatchIds: createdDispatchId ? [createdDispatchId] : [],
      receiptIds: createdReceiptId ? [createdReceiptId] : []
    };

    if (cleanupPayload.mrnIds.length || cleanupPayload.dispatchIds.length || cleanupPayload.receiptIds.length) {
      try {
        await apiHelpers.cleanupMrnTestData(cleanupPayload);
      } catch (error) {
        console.warn('Cleanup step failed for MRN workflow test:', error);
      }
    }
  });

  test('should create MRN, dispatch materials, and confirm receipt', async ({ page }) => {
    const loginPage = new LoginPage(page);

    const projectName = `E2E MRN Project ${Date.now()}`;
    const materialsRequested: MaterialItem[] = [
      {
        material_name: 'Cotton Fabric Premium',
        material_code: 'FAB001',
        quantity_required: 25,
        uom: 'meters',
        rate: 150,
        color: 'Royal Blue',
        gsm: '180',
        width: '58"',
        notes: 'Primary fabric for production batch'
      },
      {
        material_name: 'Polyester Thread',
        material_code: 'TRD002',
        quantity_required: 60,
        uom: 'cones',
        rate: 40,
        color: 'White',
        notes: 'Support material for stitching'
      }
    ];

    await test.step('Login as manufacturing supervisor and create MRN', async () => {
      await loginPage.navigate();
      await loginPage.login(testUsers.productionSupervisor.email, testUsers.productionSupervisor.password);
      await loginPage.waitForLogin();

      const mrnPayload = {
        project_name: projectName,
        priority: 'high',
        required_by_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: `Automated MRN request for ${projectName}`,
        materials_requested: materialsRequested
      };

      const mrnResponse = await apiHelpers.createMrnRequest(mrnPayload);
      expect(mrnResponse.status).toBe(201);

      const materialRequest = mrnResponse.data?.materialRequest as MaterialItem | undefined;
      expect(materialRequest).toBeTruthy();

      createdMrnId = materialRequest?.id;
      createdMrnNumber = materialRequest?.request_number ?? mrnResponse.data?.request_number;
      expect(createdMrnId).toBeTruthy();
      expect(createdMrnNumber).toBeTruthy();

      const storedMaterials: MaterialItem[] = Array.isArray(materialRequest?.materials_requested)
        ? materialRequest?.materials_requested
        : JSON.parse(materialRequest?.materials_requested ?? '[]');

      expect(storedMaterials).toHaveLength(materialsRequested.length);

      dispatchMaterials = storedMaterials.map((material: MaterialItem) => ({
        material_name: material.material_name,
        material_code: material.material_code ?? '',
        quantity_requested: material.quantity_required ?? material.quantity,
        quantity_dispatched: material.quantity_required ?? material.quantity,
        uom: material.uom ?? 'units',
        inventory_id: material.inventory_id ?? null,
        notes: `Dispatch for ${createdMrnNumber}`
      }));

      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.context().clearCookies();
    });

    await test.step('Login as inventory controller and dispatch materials', async () => {
      await loginPage.navigate();
      await loginPage.login(testUsers.inventoryController.email, testUsers.inventoryController.password);
      await loginPage.waitForLogin();

      const dispatchPayload = {
        mrn_request_id: createdMrnId,
        dispatched_materials: dispatchMaterials,
        dispatch_notes: `Dispatch generated for ${createdMrnNumber}`,
        dispatch_photos: []
      };

      const dispatchResponse = await apiHelpers.createMaterialDispatch(dispatchPayload);
      expect(dispatchResponse.status).toBe(201);

      const dispatchData = dispatchResponse.data?.dispatch as MaterialItem | undefined;
      expect(dispatchData).toBeTruthy();

      createdDispatchId = dispatchData?.id;
      expect(createdDispatchId).toBeTruthy();
      expect(dispatchData?.received_status).toBe('pending');

      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.context().clearCookies();
    });

    await test.step('Login as manufacturing receiver and log material receipt', async () => {
      await loginPage.navigate();
      await loginPage.login(testUsers.manufacturingReceiver.email, testUsers.manufacturingReceiver.password);
      await loginPage.waitForLogin();

      const receiptPayload = {
        mrn_request_id: createdMrnId,
        dispatch_id: createdDispatchId,
        received_materials: dispatchMaterials.map((material: MaterialItem) => ({
          material_name: material.material_name,
          material_code: material.material_code,
          quantity_received: material.quantity_dispatched,
          uom: material.uom,
          quality_status: 'accepted',
          notes: `Received for ${createdMrnNumber}`
        })),
        has_discrepancy: false,
        receipt_notes: `All items received for ${createdMrnNumber}`,
        receipt_photos: []
      };

      const receiptResponse = await apiHelpers.createMaterialReceipt(receiptPayload);
      expect(receiptResponse.status).toBe(201);

      const receiptData = receiptResponse.data?.receipt as MaterialItem | undefined;
      expect(receiptData).toBeTruthy();

      createdReceiptId = receiptData?.id;
      expect(receiptData?.received_materials?.length ?? 0).toBe(dispatchMaterials.length);

      const dispatchLookup = await apiHelpers.getDispatchByMrn(createdMrnId);
      expect(dispatchLookup.status).toBe(200);
      const dispatchRecord = dispatchLookup.data?.dispatch ?? dispatchLookup.data;
      expect(dispatchRecord?.received_status).toBe('received');

      const mrnLookup = await apiHelpers.getMrnRequest(createdMrnId as number);
      expect(mrnLookup.status).toBe(200);
      const mrnRecord = mrnLookup.data?.materialRequest ?? mrnLookup.data;
      expect(mrnRecord?.status).toBe('issued');

      const receiptLookup = await apiHelpers.getReceiptByDispatch(createdDispatchId as number);
      expect(receiptLookup.status).toBe(200);
      const receiptRecord = receiptLookup.data?.receipt ?? receiptLookup.data;
      expect(receiptRecord?.verification_status).toBe('pending');
    });
  });
});