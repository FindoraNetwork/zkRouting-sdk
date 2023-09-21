export const getLedger = async () => {
    try {
        return await import('findora-wallet-wasm/web');
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
export const initLedger = async () => {
    try {
        const ledger = await getLedger();
        if (typeof ledger?.default === 'function') {
            await ledger?.default();
        }
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
//# sourceMappingURL=index.js.map