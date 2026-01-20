import requests
import sys
import json
from datetime import datetime

class WafflePOPAPITester:
    def __init__(self, base_url="https://points-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                except:
                    response_data = {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.content else {}
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                response_data = {}

            self.test_results.append({
                "name": name,
                "success": success,
                "status_code": response.status_code,
                "expected_status": expected_status
            })

            return success, response_data

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_user_registration(self, name):
        """Test user registration"""
        return self.run_test(
            "User Registration",
            "POST",
            "users/register",
            200,
            data={"name": name}
        )

    def test_user_login(self, name):
        """Test user login"""
        return self.run_test(
            "User Login",
            "POST",
            "users/login",
            200,
            data={"name": name}
        )

    def test_user_login_not_found(self, name):
        """Test user login with non-existent name"""
        return self.run_test(
            "User Login (Not Found)",
            "POST",
            "users/login",
            404,
            data={"name": name}
        )

    def test_get_user(self, user_id):
        """Test get user by ID"""
        return self.run_test(
            "Get User by ID",
            "GET",
            f"users/{user_id}",
            200
        )

    def test_get_all_users(self):
        """Test get all users"""
        return self.run_test(
            "Get All Users",
            "GET",
            "users",
            200
        )

    def test_admin_login_valid(self):
        """Test admin login with correct password"""
        return self.run_test(
            "Admin Login (Valid)",
            "POST",
            "admin/login",
            200,
            data={"password": "1607"}
        )

    def test_admin_login_invalid(self):
        """Test admin login with wrong password"""
        return self.run_test(
            "Admin Login (Invalid)",
            "POST",
            "admin/login",
            401,
            data={"password": "wrong"}
        )

    def test_add_points(self, user_id, points, reason="Purchase"):
        """Test adding points to user"""
        return self.run_test(
            "Add Points to User",
            "POST",
            "admin/add-points",
            200,
            data={"user_id": user_id, "points": points, "reason": reason}
        )

    def test_get_rewards(self):
        """Test get rewards catalog"""
        return self.run_test(
            "Get Rewards Catalog",
            "GET",
            "rewards",
            200
        )

    def test_redeem_reward(self, user_id, reward_id):
        """Test redeem reward"""
        return self.run_test(
            "Redeem Reward",
            "POST",
            "rewards/redeem",
            200,
            data={"user_id": user_id, "reward_id": reward_id}
        )

    def test_redeem_reward_insufficient_points(self, user_id, reward_id):
        """Test redeem reward with insufficient points"""
        return self.run_test(
            "Redeem Reward (Insufficient Points)",
            "POST",
            "rewards/redeem",
            400,
            data={"user_id": user_id, "reward_id": reward_id}
        )

    def test_get_redemptions(self):
        """Test get all redemptions"""
        return self.run_test(
            "Get All Redemptions",
            "GET",
            "redemptions",
            200
        )

    def test_get_user_redemptions(self, user_id):
        """Test get user redemptions"""
        return self.run_test(
            "Get User Redemptions",
            "GET",
            f"redemptions/user/{user_id}",
            200
        )

    def test_mark_claimed(self, redemption_id):
        """Test mark redemption as claimed"""
        return self.run_test(
            "Mark Redemption as Claimed",
            "POST",
            "redemptions/mark-claimed",
            200,
            data={"redemption_id": redemption_id}
        )

    def test_get_leaderboard(self):
        """Test get leaderboard"""
        return self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )

    def test_get_transactions(self):
        """Test get transactions"""
        return self.run_test(
            "Get Transactions",
            "GET",
            "admin/transactions",
            200
        )

    def test_admin_create_user_with_points(self, name, points):
        """Test admin create user with initial points"""
        return self.run_test(
            "Admin Create User with Points",
            "POST",
            "admin/create-user",
            200,
            data={"name": name, "points": points}
        )

def main():
    print("🧪 Starting Waffle Pop Co API Tests...")
    print("=" * 50)
    
    tester = WafflePOPAPITester()
    test_user_name = f"TestUser_{datetime.now().strftime('%H%M%S')}"
    user_id = None
    redemption_id = None

    # Test 1: Root endpoint
    tester.test_root_endpoint()

    # Test 2: User registration
    success, user_data = tester.test_user_registration(test_user_name)
    if success and 'id' in user_data:
        user_id = user_data['id']
        print(f"   Created user ID: {user_id}")

    # Test 3: User login with existing name
    if user_id:
        tester.test_user_login(test_user_name)

    # Test 4: User login with non-existent name
    tester.test_user_login_not_found("NonExistentUser123")

    # Test 5: Get user by ID
    if user_id:
        tester.test_get_user(user_id)

    # Test 6: Get all users
    tester.test_get_all_users()

    # Test 7: Admin login with correct password
    tester.test_admin_login_valid()

    # Test 8: Admin login with wrong password
    tester.test_admin_login_invalid()

    # Test 9: Add points to user
    if user_id:
        success, _ = tester.test_add_points(user_id, 500, "Test Purchase")

    # Test 10: Get rewards catalog
    success, rewards_data = tester.test_get_rewards()
    reward_id = None
    if success and rewards_data and len(rewards_data) > 0:
        reward_id = rewards_data[0]['id']  # Get first reward (200 pts)
        print(f"   Found reward ID: {reward_id} ({rewards_data[0]['name']})")

    # Test 11: Redeem reward (should work now with 500 points)
    if user_id and reward_id:
        success, redeem_data = tester.test_redeem_reward(user_id, reward_id)
        if success and 'reward_code' in redeem_data:
            print(f"   Reward code generated: {redeem_data['reward_code']}")

    # Test 12: Try to redeem expensive reward with insufficient points
    if user_id and rewards_data and len(rewards_data) >= 5:
        expensive_reward_id = rewards_data[4]['id']  # 800 pts reward
        tester.test_redeem_reward_insufficient_points(user_id, expensive_reward_id)

    # Test 13: Get all redemptions
    success, redemptions_data = tester.test_get_redemptions()
    if success and redemptions_data and len(redemptions_data) > 0:
        redemption_id = redemptions_data[0]['id']
        print(f"   Found redemption ID: {redemption_id}")

    # Test 14: Get user redemptions
    if user_id:
        tester.test_get_user_redemptions(user_id)

    # Test 15: Mark redemption as claimed
    if redemption_id:
        tester.test_mark_claimed(redemption_id)

    # Test 16: Get leaderboard
    tester.test_get_leaderboard()

    # Test 17: Get transactions
    tester.test_get_transactions()

    # Test 18: Admin create user with points (NEW FEATURE)
    admin_user_name = f"AdminCreated_{datetime.now().strftime('%H%M%S')}"
    success, admin_user_data = tester.test_admin_create_user_with_points(admin_user_name, 250)
    if success and 'id' in admin_user_data:
        print(f"   Admin created user ID: {admin_user_data['id']} with {admin_user_data['current_points']} points")

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    failed_tests = [test for test in tester.test_results if not test['success']]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test['name']}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())