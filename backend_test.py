import requests
import sys
import json
from datetime import datetime

class WeddingAppAPITester:
    def __init__(self):
        self.base_url = "https://casamento-presentes-1.preview.emergentagent.com/api"
        self.admin_token = None
        self.test_guest_id = None
        self.test_gift_id = None
        self.test_vaquinha_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append(f"{test_name}: {details}")
        print()

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add admin token if available
        if self.admin_token:
            test_headers['Authorization'] = f'Bearer {self.admin_token}'
            
        # Override with custom headers
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (expected {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_result(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status_code": response.status_code}
            return None

        except Exception as e:
            self.log_result(name, False, f"Exception: {str(e)}")
            return None

    def test_admin_login(self):
        """Test admin authentication"""
        print("=== TESTING ADMIN AUTHENTICATION ===")
        
        # Test valid login
        login_data = {
            "adminId": "noivos2024",
            "password": "casamento123"
        }
        
        result = self.run_test(
            "Admin Login (Valid Credentials)",
            "POST",
            "/admin/login",
            200,
            data=login_data
        )
        
        if result and 'token' in result:
            self.admin_token = result['token']
            self.log_result("Token Extraction", True, "Token saved successfully")
        else:
            self.log_result("Token Extraction", False, "No token in response")
            
        # Test invalid login
        invalid_login = {
            "adminId": "wrong",
            "password": "wrong"
        }
        
        self.run_test(
            "Admin Login (Invalid Credentials)",
            "POST", 
            "/admin/login",
            401,
            data=invalid_login
        )

    def test_wedding_info(self):
        """Test wedding info endpoints"""
        print("=== TESTING WEDDING INFO ===")
        
        # Get wedding info
        self.run_test(
            "Get Wedding Info",
            "GET",
            "/wedding-info",
            200
        )
        
        # Update wedding info (requires admin token)
        if self.admin_token:
            update_data = {
                "date": "25 de Janeiro de 2025",
                "time": "18h00",
                "location": "Igreja São José, São Paulo - SP",
                "coupleMessage": "Teste de mensagem do casal para os convidados",
                "pixKey": "teste@pix.com"
            }
            
            self.run_test(
                "Update Wedding Info",
                "PUT",
                "/wedding-info",
                200,
                data=update_data
            )

    def test_guest_operations(self):
        """Test guest-related operations"""
        print("=== TESTING GUEST OPERATIONS ===")
        
        # Create a guest
        guest_data = {
            "name": "João Silva Test",
            "email": "joao.test@email.com",
            "phone": "(11) 99999-9999",
            "companions": [
                {"name": "Maria Silva", "age": 30},
                {"name": "Pedro Silva", "age": 8}
            ],
            "message": "Estamos muito felizes pelo convite!"
        }
        
        result = self.run_test(
            "Create Guest",
            "POST",
            "/guests",
            200,  # Based on the model, it should return Guest object
            data=guest_data
        )
        
        if result and 'id' in result:
            self.test_guest_id = result['id']
            
        # Get guests list (admin only)
        if self.admin_token:
            self.run_test(
                "Get Guests List (Admin)",
                "GET",
                "/guests",
                200
            )
        
        # Try to get guests without auth (should fail)
        temp_token = self.admin_token
        self.admin_token = None
        self.run_test(
            "Get Guests List (No Auth)",
            "GET",
            "/guests",
            401
        )
        self.admin_token = temp_token

    def test_gift_operations(self):
        """Test gift-related operations"""
        print("=== TESTING GIFT OPERATIONS ===")
        
        # Get gifts (public)
        self.run_test(
            "Get Gifts List",
            "GET",
            "/gifts",
            200
        )
        
        # Create a gift (admin only)
        if self.admin_token:
            gift_data = {
                "name": "Jogo de Panelas",
                "description": "Jogo de panelas antiaderentes 5 peças",
                "imageUrl": "https://example.com/panelas.jpg",
                "price": "R$ 299,90"
            }
            
            result = self.run_test(
                "Create Gift (Admin)",
                "POST",
                "/gifts",
                200,
                data=gift_data
            )
            
            if result and 'id' in result:
                self.test_gift_id = result['id']
                
                # Test claim gift
                if self.test_guest_id:
                    claim_url = f"/gifts/{self.test_gift_id}/claim?guest_id={self.test_guest_id}&guest_name=João Silva Test"
                    self.run_test(
                        "Claim Gift",
                        "PUT",
                        claim_url,
                        200
                    )
                    
                # Test delete gift
                self.run_test(
                    "Delete Gift (Admin)",
                    "DELETE",
                    f"/gifts/{self.test_gift_id}",
                    200
                )
        
        # Try to create gift without auth
        temp_token = self.admin_token
        self.admin_token = None
        self.run_test(
            "Create Gift (No Auth)",
            "POST",
            "/gifts",
            401,
            data={"name": "Test Gift"}
        )
        self.admin_token = temp_token

    def test_vaquinha_operations(self):
        """Test vaquinha-related operations"""
        print("=== TESTING VAQUINHA OPERATIONS ===")
        
        # Get vaquinhas (public)
        self.run_test(
            "Get Vaquinhas List",
            "GET",
            "/vaquinhas",
            200
        )
        
        # Create vaquinha (admin only)
        if self.admin_token:
            vaquinha_data = {
                "title": "Luna de Mel",
                "description": "Ajude-nos a realizar nossa lua de mel dos sonhos!",
                "goal": 5000.0,
                "pixKey": "luademel@pix.com",
                "qrCodeUrl": "https://example.com/qrcode.png"
            }
            
            result = self.run_test(
                "Create Vaquinha (Admin)",
                "POST",
                "/vaquinhas",
                200,
                data=vaquinha_data
            )
            
            if result and 'id' in result:
                self.test_vaquinha_id = result['id']
                
                # Test update vaquinha
                update_data = {
                    "title": "Luna de Mel Atualizada",
                    "description": "Descrição atualizada",
                    "goal": 6000.0,
                    "pixKey": "updated@pix.com"
                }
                
                self.run_test(
                    "Update Vaquinha (Admin)",
                    "PUT",
                    f"/vaquinhas/{self.test_vaquinha_id}",
                    200,
                    data=update_data
                )
                
                # Test delete vaquinha
                self.run_test(
                    "Delete Vaquinha (Admin)",
                    "DELETE",
                    f"/vaquinhas/{self.test_vaquinha_id}",
                    200
                )

    def test_cors_and_options(self):
        """Test CORS configuration"""
        print("=== TESTING CORS ===")
        
        try:
            response = requests.options(f"{self.base_url}/wedding-info", timeout=10)
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            has_cors = any(cors_headers.values())
            self.log_result("CORS Headers", has_cors, f"Headers: {cors_headers}")
            
        except Exception as e:
            self.log_result("CORS Test", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 STARTING WEDDING APP API TESTING")
        print(f"Base URL: {self.base_url}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 50)
        
        # Test sequence
        self.test_admin_login()
        self.test_wedding_info()
        self.test_guest_operations()
        self.test_gift_operations() 
        self.test_vaquinha_operations()
        self.test_cors_and_options()
        
        # Final results
        print("=" * 50)
        print(f"📊 FINAL RESULTS")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failed in self.failed_tests:
                print(f"  • {failed}")
        
        print("\n" + "=" * 50)
        
        # Return exit code
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = WeddingAppAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())