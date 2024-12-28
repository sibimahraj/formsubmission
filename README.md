 expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: {"dataLayer": {"event": "ButtonClick", "label": "Submit Button"}}

    Number of calls: 0

       98 |      // trackEvents.trackCustomEvent(eventData);
       99 |
    > 100 |       expect(TagManager.dataLayer).toHaveBeenCalledWith({
          |                                    ^
      101 |         dataLayer: eventData,
      102 |       });
      103 |     });

      at Object.toHaveBeenCalledWith (src/services/track-events.test.ts:100:36)
