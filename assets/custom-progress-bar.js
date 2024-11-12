document.addEventListener('DOMContentLoaded', () => {
    const circles = document.querySelectorAll('.circle');
    const progressLine = document.querySelector('.line .progress');
    const progressContainer = document.getElementById('progress-container');
    const progressDescription = document.getElementById('progress-description-text');
    const askAboutDiscount = document.getElementById('ask-about-discount');
    
    // Maximum cart count to complete the progress
    const maxCartItems = 5; // This is arbitrary, adjust as needed.

    const stepDescriptions = [
        "Limited Time Offer: Buy 2 Get 1 Free",
        "Add one more to get one free",
        "Great! Now pick your free art",
        "Add one more to get two free",
        "Now pick your second free art",
        "Great job! Checkout before they sell out"
    ];

    // Update progress bar based on the cart count
    function updateProgressBar(cartCount) {
        console.log('this is update progress bar function');
        let step = Math.min(cartCount, maxCartItems); // Don't exceed the max steps
        const stepProgress = [0, 15, 38, 64, 87, 100]; // Adjust progress percentages
        
        // Update circle background colors
        circles.forEach((circle, index) => {
            if (index < step) {
                circle.classList.add('blue'); // Completed steps
                if (circle.classList.contains('special')) {
                    circle.innerHTML = '<span>&#10003;</span>'; // Change +1 or +2 to tick
                }
            } else {
                circle.classList.remove('blue'); // Uncompleted steps
                if (circle.classList.contains('special')) {
                    circle.innerHTML = index === 2 ? "+1" : "+2"; // Reset to +1 and +2 for step 3 and 5
                }
            }
        });

        // Update progress line width
        progressLine.style.width = stepProgress[step] + '%';
        // Update the description text based on the current step
        progressDescription.textContent = stepDescriptions[step];
        askAboutDiscount.classList.remove('hide');
        askAboutDiscount.classList.add('show');
        
        if (cartCount > 0){
            progressContainer.classList.remove('hide');
            progressContainer.classList.add('show');
        }
        else {
            progressContainer.classList.remove('show');
            progressContainer.classList.add('hide');
        }

    }

    function fetchDiscountCollection(handle, page = 1, limit = 250, allProductIds = []) {
        const cacheKey = `discountCollection_${handle}`;
        const cacheExpiryKey = `discountCollectionExpiry_${handle}`;

            // Get cached data and expiry time from localStorage
        const cachedCollection = localStorage.getItem(cacheKey);
        const expiryTime = localStorage.getItem(cacheExpiryKey);
        const currentTime = new Date().getTime();

        // Check if the cache is valid and hasn't expired (1 hour)
        if (cachedCollection && expiryTime && currentTime < expiryTime) {
            //console.log('Using cached collection data', cachedCollection);
            return Promise.resolve(JSON.parse(cachedCollection));
        }
        // Fetch products with pagination, up to 250 per page (maximum allowed by Shopify)
        return fetch(`/collections/${handle}/products.json?page=${page}&limit=${limit}`)
            .then(response => response.json())
            .then(data => {
                // Concatenate the fetched products with the existing products
                allProductIds = allProductIds.concat(data.products.map(product => product.id));
    
                // If the number of fetched products is less than the limit, we've fetched all products
                if (data.products.length < limit) {
                    // Cache the final product list
                    localStorage.setItem(cacheKey, JSON.stringify(allProductIds));
                    localStorage.setItem(cacheExpiryKey, currentTime + 3600 * 1000); // Cache expires in 1 hour
                    //console.log('returning after caching ......', cacheKey);
                    return allProductIds; // Return array of product IDs
                } else {
                    // Otherwise, fetch the next page
                    return fetchDiscountCollection(handle, page + 1, limit, allProductIds);
                }
            })
            .catch(error => console.error('Error fetching discount collection:', error));
    }

    function fetchCart() {
        return fetch('/cart.js')
            .then(response => response.json())
            .catch(error => console.error('Error fetching cart:', error));
    }

    function countEligibleProducts(cart, productIds) {
        let count = 0;

        cart.items.forEach(item => {
            // Check if the product ID of the cart item is in the discount collection
            if (productIds.includes(item.product_id)) {
                count += item.quantity; // Increase counter by quantity of the item
            }
        });

        return count;
    }


    function checkCartForDiscounts() {
        // Replace 'discount-collection-handle' with your actual collection handle
        const collectionHandle = window.discountedCollectionHandle;

        if (collectionHandle) {
            Promise.all([fetchDiscountCollection(collectionHandle), fetchCart()])
                .then(([discountCollectionProductIds, cart]) => {
                    const eligibleCount = countEligibleProducts(cart, discountCollectionProductIds);

                    console.log(`Total eligible items in cart: ${eligibleCount}`);
                    updateProgressBar(eligibleCount);
                })
                .catch(error => console.error('Error in checking cart for discounts:', error));
        }
    }

    // Call this function on cart update
    checkCartForDiscounts();

    const elementToObserve = document.querySelector(".Header__CartDot");

    // Create a MutationObserver to detect changes in innerText
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            console.log('innerText changed to:', elementToObserve.innerText);
            checkCartForDiscounts();
        });
    });

    // Set the configuration to observe only child node changes (text)
    observer.observe(elementToObserve, { childList: true, subtree: true });
    // Monitor for changes in the cart (for dynamic updates)

    $('#ask-about-discount').click(function () {
        $('.discount-info-popup').addClass('visible');
        //document.getElementById("cart-popup-overlay").style.display = "block";
    });

    $('.discount-info-popup .popup_close').click(function(){
        $('.discount-info-popup').removeClass('visible');
        document.getElementById("cart-popup-overlay").style.display = "none";
    });

})