-- RPC Function to Safely Verify LPK Report
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION verify_lpk_report(
    p_report_id UUID,
    p_user_id UUID,
    p_action TEXT, -- 'approve' or 'reject'
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/admin)
SET search_path = public
AS $$
DECLARE
    v_report_exists BOOLEAN;
    v_profile_exists BOOLEAN;
BEGIN
    -- 1. Check if Report Exists
    SELECT EXISTS (SELECT 1 FROM lpk_reports WHERE id = p_report_id) INTO v_report_exists;
    IF NOT v_report_exists THEN
        RETURN jsonb_build_object('success', false, 'error', 'Report ID not found');
    END IF;

    -- 2. Check if Profile Exists
    SELECT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_profile_exists;
    IF NOT v_profile_exists THEN
        RETURN jsonb_build_object('success', false, 'error', 'User Profile not found');
    END IF;

    -- 3. Handle 'approve'
    IF p_action = 'approve' THEN
        -- A. Verify Account
        UPDATE profiles 
        SET account_status = 'verified', 
            rejection_message = NULL 
        WHERE id = p_user_id;

        -- B. Approve Report
        UPDATE lpk_reports 
        SET status = 'APPROVED',
            rejection_reason = NULL
        WHERE id = p_report_id;

        RETURN jsonb_build_object('success', true, 'message', 'Verified successfully');
    
    -- 4. Handle 'reject'
    ELSIF p_action = 'reject' THEN
        -- A. Reject Report
        UPDATE lpk_reports 
        SET status = 'REJECTED',
            rejection_reason = p_reason
        WHERE id = p_report_id;
        
        -- B. Notify Profile
        UPDATE profiles
        SET rejection_message = 'Laporan Anda Ditolak: ' || COALESCE(p_reason, '-')
        WHERE id = p_user_id;

        RETURN jsonb_build_object('success', true, 'message', 'Rejected successfully');
    
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
