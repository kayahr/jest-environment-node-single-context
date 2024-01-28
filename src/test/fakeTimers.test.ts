describe("fake timers", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it("can be used with single context node env", () => {
        jest.useFakeTimers();
        jest.spyOn(global, "setTimeout");
        const callback = jest.fn();
        setTimeout(callback, 1000);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
        jest.runAllTimers();
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
