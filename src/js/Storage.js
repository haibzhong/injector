const storage = chrome.storage.local;

export default class Storage {
    getStore() {
        storage.get('injector');
    }

    setStore(data) {
        storage.set({
            'injector': data
        }, function() {
            
        });
    }
}
