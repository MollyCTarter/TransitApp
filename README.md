Submitted by: Molly Tarter

            Website Description: Allows users to find which trains are coming into any station in the WMATA train system, with  data about the train that may be relevant to customers, including if it is a 6 or 8 car train, the train's destination, which line(color) it is, and how many minutes away from the station it is.
            Customer's can input feedback about WMATA, which goes into MongoDB, they also have the ability to "clear" all the feedback they entered, which empties the collection in MongoDB.
            
            YouTube Video Link: https://youtu.be/vD8zh8YLNiI
            
            APIs: WMATA (Washington Metropolitan Area Transit Authority) Real-Time Rail Predictions API
            (https://api.wmata.com/StationPrediction.svc/json/GetPrediction/ALL?api_key=ef1e5a59812e4481b9fb6ae7ab523932)
            *ALL captures all stations, but specific station(location) codes are used to narrow results.  ef1e5a59812e4481b9fb6ae7ab523932 is the primary code associated with my developer account with WMATA, which should be accessible without logging in.  Some stations appear more than once because they have more than one platform.  Because this is real-time data, this project needs to be tested during WMATA train operating hours.
            
            Contact Email:  mtarter@terpmail.umd.edu# TransitApp
# TransitApp
